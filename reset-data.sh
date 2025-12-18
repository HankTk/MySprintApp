#!/bin/bash

# Initial Setup Script - Reset All Data
# This script resets all data files and counters to their initial state

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Data directory
DATA_DIR="data"

# Counter initial values (matching Java repository constants)
INITIAL_ORDER_NUMBER=100000
INITIAL_INVOICE_NUMBER=200000
INITIAL_PO_NUMBER=300000
INITIAL_PO_INVOICE_NUMBER=400000
INITIAL_RMA_NUMBER=500000
INITIAL_SFC_NUMBER=600000

# Data files to reset (empty arrays)
DATA_FILES=(
    "addresses.json"
    "customers.json"
    "inventory.json"
    "orders.json"
    "products.json"
    "purchase_orders.json"
    "rmas.json"
    "sfcs.json"
    "users.json"
    "vendors.json"
    "warehouses.json"
)

# Counter files with their initial values (using parallel arrays for bash 3.2 compatibility)
COUNTER_FILE_NAMES=(
    "order_counter.json"
    "invoice_counter.json"
    "po_counter.json"
    "po_invoice_counter.json"
    "rma_counter.json"
    "sfc_counter.json"
)

COUNTER_FILE_VALUES=(
    $INITIAL_ORDER_NUMBER
    $INITIAL_INVOICE_NUMBER
    $INITIAL_PO_NUMBER
    $INITIAL_PO_INVOICE_NUMBER
    $INITIAL_RMA_NUMBER
    $INITIAL_SFC_NUMBER
)

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create backup
create_backup() {
    local backup_dir="data_backup_$(date +%Y%m%d_%H%M%S)"
    print_info "Creating backup in: $backup_dir"
    
    if [ -d "$DATA_DIR" ]; then
        mkdir -p "$backup_dir"
        cp -r "$DATA_DIR"/* "$backup_dir/" 2>/dev/null || true
        print_info "Backup created successfully"
        echo "$backup_dir"
    else
        print_warning "Data directory does not exist, skipping backup"
        echo ""
    fi
}

# Function to reset data files
reset_data_files() {
    print_info "Resetting data files..."
    
    for file in "${DATA_FILES[@]}"; do
        local filepath="$DATA_DIR/$file"
        if [ -f "$filepath" ]; then
            echo "[]" > "$filepath"
            print_info "Reset: $file"
        else
            # Create file if it doesn't exist
            echo "[]" > "$filepath"
            print_info "Created: $file"
        fi
    done
}

# Function to reset counter files
reset_counter_files() {
    print_info "Resetting counter files..."
    
    local i=0
    while [ $i -lt ${#COUNTER_FILE_NAMES[@]} ]; do
        local counter_file="${COUNTER_FILE_NAMES[$i]}"
        local initial_value="${COUNTER_FILE_VALUES[$i]}"
        local filepath="$DATA_DIR/$counter_file"
        
        echo "$initial_value" > "$filepath"
        print_info "Reset: $counter_file to $initial_value"
        i=$((i + 1))
    done
}

# Main function
main() {
    echo "=========================================="
    echo "  Spring System - Data Reset Script"
    echo "=========================================="
    echo ""
    print_warning "This script will:"
    echo "  1. Reset all data files to empty arrays []"
    echo "  2. Reset all counters to their initial values"
    echo "  3. Create a backup of existing data (optional)"
    echo ""
    print_error "WARNING: This will DELETE all existing data!"
    echo ""
    
    # Ask for confirmation
    read -p "Do you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Operation cancelled."
        exit 0
    fi
    
    # Ask about backup
    read -p "Create backup before reset? (yes/no): " backup_confirm
    if [ "$backup_confirm" = "yes" ]; then
        backup_dir=$(create_backup)
        if [ -n "$backup_dir" ]; then
            echo ""
            print_info "Backup location: $backup_dir"
            echo ""
        fi
    fi
    
    # Ensure data directory exists
    if [ ! -d "$DATA_DIR" ]; then
        print_info "Creating data directory: $DATA_DIR"
        mkdir -p "$DATA_DIR"
    fi
    
    echo ""
    print_info "Starting data reset..."
    echo ""
    
    # Reset data files
    reset_data_files
    
    echo ""
    
    # Reset counter files
    reset_counter_files
    
    echo ""
    print_info "=========================================="
    print_info "Data reset completed successfully!"
    print_info "=========================================="
    echo ""
    print_info "Summary:"
    echo "  - Reset ${#DATA_FILES[@]} data files"
    echo "  - Reset ${#COUNTER_FILE_NAMES[@]} counter files"
    echo ""
    print_info "Counter reset values:"
    echo "  - Order: $INITIAL_ORDER_NUMBER"
    echo "  - Invoice: $INITIAL_INVOICE_NUMBER"
    echo "  - PO: $INITIAL_PO_NUMBER"
    echo "  - PO Invoice: $INITIAL_PO_INVOICE_NUMBER"
    echo "  - RMA: $INITIAL_RMA_NUMBER"
    echo "  - SFC: $INITIAL_SFC_NUMBER"
    echo ""
}

# Run main function
main
