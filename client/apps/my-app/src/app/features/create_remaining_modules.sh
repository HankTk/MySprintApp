#!/bin/bash
# Customer実装をテンプレートとして、残りのモジュールを作成するスクリプト

# 各モジュールの定義
declare -A modules=(
  ["addresses"]="Address"
  ["vendors"]="Vendor"
  ["warehouses"]="Warehouse"
  ["inventory"]="Inventory"
  ["purchase-orders"]="PurchaseOrder"
  ["rmas"]="RMA"
  ["sfcs"]="SFC"
)

# Customerのファイルをコピーして、各モジュール用に変更
for module_dir in "${!modules[@]}"; do
  entity_name="${modules[$module_dir]}"
  echo "Creating $module_dir module for $entity_name..."
  
  # ディレクトリ構造は既に作成済み
  
  # モデルファイルを作成（簡易版）
  cat > "$module_dir/models/${module_dir%-*}.model.ts" << MODEL_EOF
export interface ${entity_name} {
  id?: string;
  jsonData?: any;
}

export interface Create${entity_name}Request {
  jsonData?: any;
}
MODEL_EOF

done
