import csv
import json

def csv_to_json(csv_file_path, json_file_path, character_name="alice"):
    result = {
        "name": character_name,
        "expressions": {},
        "lines": {
            "timeSlotA": {},
            "feelingCategory": {},
            "weekday": {}
        }
    }

    with open(csv_file_path, newline="", encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            category = row["category"]
            key = row["key"]
            value = row["value"]
            if category == "expression":
                result["expressions"][key] = value
            elif category in result["lines"]:
                result["lines"][category][key] = value

    with open(json_file_path, "w", encoding="utf-8") as jsonfile:
        json.dump(result, jsonfile, ensure_ascii=False, indent=2)
    print(f"✅ JSONファイル出力完了: {json_file_path}")

# 実行例
if __name__ == "__main__":
    csv_to_json("character_template_from_json.csv", "alice.json", character_name="alice")
