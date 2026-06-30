#!/usr/bin/env python3
"""
KidGuide – Extractor de lugares asistido por HuggingFace
=========================================================
Uso:
    pip install requests beautifulsoup4 transformers torch --break-system-packages
    python extract_places_hf.py --city bogota --url "https://www.ejemplo.gov.co/parques"
    python extract_places_hf.py --city bogota --text "texto del lugar a procesar"

Genera un JSON listo para copiar en places_CIUDAD.js

Modelos usados (todos gratuitos en HuggingFace):
  • mrm8488/bert-spanish-cased-finetuned-ner  → extrae nombres, direcciones, precios
  • deepset/roberta-base-squad2               → extrae horarios, edades, precios
  • facebook/bart-large-mnli                  → clasifica categoría
  • csebuetnlp/mT5_multilingual_XLSum        → genera descripción corta
"""

import argparse
import json
import re
import sys
import time
import requests
from bs4 import BeautifulSoup

# ── Configuración ─────────────────────────────────────────────
HF_API   = "https://api-inference.huggingface.co/models"
HF_TOKEN = ""  # Opcional: tu token de huggingface.co/settings/tokens

HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

CATEGORY_LABELS = [
    "parque o museo infantil",
    "granja o zoológico o animales",
    "restaurante familiar",
    "entretenimiento o parque de diversiones",
    "actividad cultural o deportiva",
]

CAT_MAP = {
    "parque o museo infantil":              "parques",
    "granja o zoológico o animales":        "granjas",
    "restaurante familiar":                 "restaurantes",
    "entretenimiento o parque de diversiones": "centros",
    "actividad cultural o deportiva":       "actividades",
}

# ── Utilidades ────────────────────────────────────────────────
def hf_query(model: str, payload: dict, retries: int = 3) -> dict:
    """Llama a la HuggingFace Inference API con reintentos."""
    url = f"{HF_API}/{model}"
    for attempt in range(retries):
        try:
            r = requests.post(url, headers=HEADERS, json=payload, timeout=30)
            if r.status_code == 503:
                # Modelo cargando — esperar
                wait = r.json().get("estimated_time", 20)
                print(f"  ⏳ Modelo cargando, esperando {wait:.0f}s...")
                time.sleep(min(wait, 30))
                continue
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"  ⚠️ Intento {attempt+1}/{retries} falló: {e}")
            time.sleep(5)
    return {}


def scrape_url(url: str) -> str:
    """Extrae texto limpio de una URL."""
    print(f"🌐 Scrapeando: {url}")
    try:
        r = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(r.text, "html.parser")
        # Eliminar scripts, estilos y nav
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        # Limpiar espacios múltiples
        text = re.sub(r"\s+", " ", text)
        return text[:3000]  # Limitar a 3000 chars para los modelos
    except Exception as e:
        print(f"  ❌ Error scrapeando: {e}")
        return ""


# ── Paso 1: Extraer entidades NER ─────────────────────────────
def extract_entities(text: str) -> dict:
    """Usa bert-spanish-NER para extraer nombre, dirección, org."""
    print("  🔍 Extrayendo entidades (bert-spanish-NER)...")
    result = hf_query(
        "mrm8488/bert-spanish-cased-finetuned-ner",
        {"inputs": text[:512]}
    )

    entities = {"nombre": [], "direccion": [], "organizacion": []}
    if isinstance(result, list):
        for ent in result:
            label = ent.get("entity_group", ent.get("entity", ""))
            word  = ent.get("word", "")
            if "PER" in label or "LOC" in label:
                entities["nombre"].append(word)
            elif "ORG" in label:
                entities["organizacion"].append(word)
            elif "MISC" in label:
                entities["direccion"].append(word)

    return entities


# ── Paso 2: QA para campos específicos ────────────────────────
def extract_field_qa(text: str, question: str) -> str:
    """Usa roberta-squad2 para extraer un campo específico."""
    result = hf_query(
        "deepset/roberta-base-squad2",
        {
            "inputs": {
                "question": question,
                "context": text[:512]
            }
        }
    )
    if isinstance(result, dict):
        answer = result.get("answer", "")
        score  = result.get("score", 0)
        if score > 0.1:
            return answer
    return ""


def extract_structured_fields(text: str) -> dict:
    """Extrae precio, horario y edad usando QA."""
    print("  ❓ Extrayendo campos con QA (roberta-squad2)...")
    fields = {}

    questions = {
        "precio":  "¿Cuánto cuesta la entrada o el precio?",
        "horario": "¿En qué horario o días está abierto?",
        "edad":    "¿Para qué edades o qué edad mínima se requiere?",
        "zona":    "¿En qué barrio, zona o dirección queda?",
    }

    for key, question in questions.items():
        answer = extract_field_qa(text, question)
        if answer:
            fields[key] = answer
        time.sleep(0.5)  # Rate limit

    return fields


# ── Paso 3: Clasificar categoría ──────────────────────────────
def classify_category(text: str) -> str:
    """Usa bart-large-mnli para clasificar la categoría del lugar."""
    print("  🏷️  Clasificando categoría (bart-large-mnli)...")
    result = hf_query(
        "facebook/bart-large-mnli",
        {
            "inputs": text[:512],
            "parameters": {"candidate_labels": CATEGORY_LABELS}
        }
    )

    if isinstance(result, dict) and "labels" in result:
        top_label = result["labels"][0]
        return CAT_MAP.get(top_label, "parques")
    return "parques"


# ── Paso 4: Generar descripción ───────────────────────────────
def summarize_description(text: str) -> str:
    """Usa mT5-XLSum para generar una descripción corta."""
    print("  📝 Generando descripción (mT5-XLSum)...")
    result = hf_query(
        "csebuetnlp/mT5_multilingual_XLSum",
        {
            "inputs": text[:1024],
            "parameters": {
                "max_length": 80,
                "min_length": 20,
                "do_sample": False
            }
        }
    )

    if isinstance(result, list) and result:
        return result[0].get("summary_text", "")[:200]
    return ""


# ── Ensamblador ───────────────────────────────────────────────
def process_place(text: str, city: str, place_id: int) -> dict:
    """Pipeline completo: texto → objeto de lugar estructurado."""
    print(f"\n{'='*50}")
    print(f"📍 Procesando lugar ID:{place_id} en {city}")
    print(f"{'='*50}")

    # 1. NER
    entities = extract_entities(text)
    time.sleep(1)

    # 2. QA campos
    fields = extract_structured_fields(text)
    time.sleep(1)

    # 3. Categoría
    category = classify_category(text)
    time.sleep(1)

    # 4. Descripción
    description = summarize_description(text)
    if not description:
        # Fallback: primeras 150 chars limpias del texto
        description = text[:150].strip() + "..."
    time.sleep(1)

    # Detectar si es gratuito
    precio_raw = fields.get("precio", "").lower()
    is_free    = any(w in precio_raw for w in ["gratis", "gratuito", "libre", "free", "sin costo"])
    price_label = "Gratis" if is_free else (fields.get("precio", "~$0") or "Consultar")

    # Construir objeto
    place = {
        "id":      place_id,
        "name":    entities["nombre"][0] if entities["nombre"] else "Nombre por confirmar",
        "cat":     category,
        "emoji":   "📍",  # Asignar manualmente según categoría
        "zone":    fields.get("zona", ""),
        "age":     fields.get("edad", "2-12"),
        "days":    [0,1,2,3,4,5,6],  # Ajustar manualmente
        "coords":  [0, 0],           # Añadir manualmente con Google Maps
        "address": fields.get("zona", ""),
        "price": {
            "free":  is_free,
            "label": price_label,
            "note":  ""
        },
        "tags":  [],   # Añadir manualmente
        "sched": fields.get("horario", "Consultar"),
        "desc":  description,
        "tip":   "Verifica horarios y precios antes de ir.",
        "stars": 3,    # Ajustar manualmente
        # Metadata para revisión
        "_raw_entities": entities,
        "_raw_fields":   fields,
        "_confidence":   "medium",
        "_needs_review": True,
    }

    return place


# ── Main ──────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="KidGuide HuggingFace Place Extractor"
    )
    parser.add_argument("--city",   required=True, help="Ciudad: bogota, cali, cartagena, medellin")
    parser.add_argument("--url",    help="URL de la página a procesar")
    parser.add_argument("--text",   help="Texto directo del lugar")
    parser.add_argument("--id",     type=int, default=9001, help="ID inicial del lugar")
    parser.add_argument("--output", default="places_extracted.json", help="Archivo de salida")
    args = parser.parse_args()

    if not args.url and not args.text:
        print("❌ Error: debes proporcionar --url o --text")
        sys.exit(1)

    # Obtener texto
    if args.url:
        text = scrape_url(args.url)
    else:
        text = args.text

    if not text.strip():
        print("❌ No se pudo obtener texto para procesar")
        sys.exit(1)

    print(f"\n📄 Texto obtenido ({len(text)} chars)")

    # Procesar
    place = process_place(text, args.city, args.id)

    # Guardar resultado
    output = {
        "city":    args.city,
        "places":  [place],
        "message": "✅ Revisa y edita los campos marcados con comentario antes de añadir a places_CIUDAD.js"
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Resultado guardado en: {args.output}")
    print("\n📋 Vista previa del lugar extraído:")
    print(json.dumps(place, ensure_ascii=False, indent=2))

    print("\n⚠️  CAMPOS QUE DEBES REVISAR MANUALMENTE:")
    print("   • id       → número único (no repetir)")
    print("   • name     → confirmar nombre correcto")
    print("   • emoji    → elegir emoji representativo")
    print("   • coords   → buscar en Google Maps y añadir [lat, lng]")
    print("   • days     → ajustar días abiertos [0=Dom...6=Sáb]")
    print("   • tags     → añadir palabras clave relevantes")
    print("   • stars    → valorar de 1 a 5")
    print("   • tip      → añadir tu consejo personal")


if __name__ == "__main__":
    main()
