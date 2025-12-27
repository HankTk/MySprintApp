import {Injectable, inject} from '@angular/core';
import {Observable, forkJoin, map} from 'rxjs';
import {OrderService} from '../../orders/services/order.service';
import {PurchaseOrderService} from '../../purchase-orders/services/purchase-order.service';
import {CustomerService} from '../../customers/services/customer.service';
import {VendorService} from '../../vendors/services/vendor.service';
import {ProductService} from '../../products/services/product.service';
import {Order} from '../../orders/models/order.model';
import {PurchaseOrder} from '../../purchase-orders/models/purchase-order.model';
import {Customer} from '../../customers/models/customer.model';
import {Vendor} from '../../vendors/models/vendor.model';
import {Product} from '../../products/models/product.model';
import {GLEntry, GLEntryType} from '../models/general-ledger-entry.model';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralLedgerService
{
  private orderService = inject(OrderService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private customerService = inject(CustomerService);
  private vendorService = inject(VendorService);
  private productService = inject(ProductService);
  private translate = inject(TranslateService);

  getGLEntries(): Observable<GLEntry[]>
  {
    return forkJoin({
      orders: this.orderService.getOrders(),
      purchaseOrders: this.purchaseOrderService.getPurchaseOrders(),
      customers: this.customerService.getCustomers(),
      vendors: this.vendorService.getVendors(),
      products: this.productService.getProducts()
    }).pipe(
        map(({orders, purchaseOrders, customers, vendors, products}) =>
        {
          const entries: GLEntry[] = [];

          // Process orders
          const processedOrders = orders.filter(order =>
              order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID'
          );

          processedOrders.forEach(order =>
          {
            const customer = customers.find(c => c.id === order.customerId);
            const customerName = customer
                ? (customer.companyName || `${customer.lastName || ''} ${customer.firstName || ''}`.trim() || customer.email || this.translate.instant('generalLedger.unknown'))
                : this.translate.instant('generalLedger.unknown');

            const shipDate = order.shipDate || order.invoiceDate || order.orderDate || '';
            const invoiceDate = order.invoiceDate || order.orderDate || '';

            // Calculate total quantity
            const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // Calculate product cost
            const productCost = order.items?.reduce((sum, item) =>
            {
              const product = products.find(p => p.id === item.productId);
              const itemCost = product?.cost || (item.unitPrice || 0) * 0.7;
              return sum + (itemCost * (item.quantity || 0));
            }, 0) || 0;

            // REVENUE entry
            if (order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID')
            {
              entries.push({
                id: `${order.id}-revenue`,
                date: shipDate || invoiceDate,
                type: 'REVENUE',
                orderId: order.id || '',
                orderNumber: order.orderNumber || '',
                invoiceNumber: order.invoiceNumber,
                customerId: order.customerId || '',
                customerName,
                description: order.invoiceNumber
                    ? this.translate.instant('generalLedger.description.revenueWithInvoice', {
                      orderNumber: order.orderNumber || '',
                      invoiceNumber: order.invoiceNumber
                    })
                    : this.translate.instant('generalLedger.description.revenue', {orderNumber: order.orderNumber || ''}),
                quantity: totalQuantity,
                amount: order.total || 0,
                status: order.status || '',
              });
            }

            // COST entry
            if (order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID')
            {
              const shippingCost = order.shippingCost || 0;
              const totalCost = productCost + shippingCost;

              if (totalCost > 0)
              {
                entries.push({
                  id: `${order.id}-cost`,
                  date: shipDate || invoiceDate,
                  type: 'COST',
                  orderId: order.id || '',
                  orderNumber: order.orderNumber || '',
                  invoiceNumber: order.invoiceNumber,
                  customerId: order.customerId || '',
                  customerName,
                  description: (order.invoiceNumber
                          ? this.translate.instant('generalLedger.description.costWithInvoice', {
                            orderNumber: order.orderNumber || '',
                            invoiceNumber: order.invoiceNumber
                          })
                          : this.translate.instant('generalLedger.description.cost', {orderNumber: order.orderNumber || ''}))
                      + this.translate.instant('generalLedger.description.costDetails', {
                        productCost: productCost.toFixed(2),
                        shippingCost: shippingCost.toFixed(2)
                      }),
                  quantity: totalQuantity,
                  amount: totalCost,
                  cost: totalCost,
                  status: order.status || '',
                });
              }
            }

            // PAYMENT entry
            if (order.status === 'PAID' && order.jsonData?.paymentAmount)
            {
              const paymentAmount = order.jsonData.paymentAmount || 0;
              const paymentDate = order.jsonData.paymentDate || order.orderDate || '';

              if (paymentAmount > 0)
              {
                entries.push({
                  id: `${order.id}-payment`,
                  date: paymentDate,
                  type: 'PAYMENT',
                  orderId: order.id || '',
                  orderNumber: order.orderNumber || '',
                  invoiceNumber: order.invoiceNumber,
                  customerId: order.customerId || '',
                  customerName,
                  description: order.invoiceNumber
                      ? this.translate.instant('generalLedger.description.paymentWithInvoice', {
                        orderNumber: order.orderNumber || '',
                        invoiceNumber: order.invoiceNumber
                      })
                      : this.translate.instant('generalLedger.description.payment', {orderNumber: order.orderNumber || ''}),
                  quantity: 0,
                  amount: paymentAmount,
                  status: 'PAID',
                });
              }
            }
          });

          // Process Purchase Orders
          const processedPOs = purchaseOrders.filter(po =>
              po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID'
          );

          processedPOs.forEach(po =>
          {
            const vendor = vendors.find(v => v.id === po.supplierId);
            const supplierName = vendor
                ? (vendor.companyName || `${vendor.lastName || ''} ${vendor.firstName || ''}`.trim() || vendor.email || this.translate.instant('generalLedger.unknown'))
                : this.translate.instant('generalLedger.unknown');

            // Handle receivedDate
            let receivedDate: string | null = null;
            if (po.jsonData?.receivedDate)
            {
              try
              {
                const receivedDateValue = po.jsonData.receivedDate;
                if (typeof receivedDateValue === 'string')
                {
                  if (receivedDateValue.match(/^\d{4}-\d{2}-\d{2}$/))
                  {
                    receivedDate = receivedDateValue;
                  }
                  else
                  {
                    receivedDate = new Date(receivedDateValue).toISOString().split('T')[0];
                  }
                }
              }
              catch (e)
              {
                console.warn('Error parsing receivedDate:', e);
              }
            }

            const invoiceDateStr = po.invoiceDate
                ? (typeof po.invoiceDate === 'string' ? po.invoiceDate : new Date(po.invoiceDate).toISOString().split('T')[0])
                : null;
            const orderDateStr = po.orderDate
                ? (typeof po.orderDate === 'string' ? po.orderDate : new Date(po.orderDate).toISOString().split('T')[0])
                : '';

            const transactionDate = receivedDate || invoiceDateStr || orderDateStr;

            // Calculate total quantity
            const totalQuantity = po.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // Calculate product cost
            const productCost = po.items?.reduce((sum, item) =>
            {
              const product = products.find(p => p.id === item.productId);
              const itemCost = product?.cost || (item.unitPrice || 0) * 0.7;
              return sum + (itemCost * (item.quantity || 0));
            }, 0) || 0;

            // EXPENSE entry
            if (po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID')
            {
              const shippingCost = po.shippingCost || 0;
              const totalCost = productCost + shippingCost;

              if (totalCost > 0)
              {
                entries.push({
                  id: `${po.id}-expense`,
                  date: transactionDate || '',
                  type: 'EXPENSE',
                  poId: po.id || '',
                  poNumber: po.orderNumber || '',
                  invoiceNumber: po.invoiceNumber,
                  supplierId: po.supplierId || '',
                  supplierName,
                  description: (po.invoiceNumber
                          ? this.translate.instant('generalLedger.description.expenseWithInvoice', {
                            poNumber: po.orderNumber || '',
                            invoiceNumber: po.invoiceNumber
                          })
                          : this.translate.instant('generalLedger.description.expense', {poNumber: po.orderNumber || ''}))
                      + this.translate.instant('generalLedger.description.expenseDetails', {
                        productCost: productCost.toFixed(2),
                        shippingCost: shippingCost.toFixed(2)
                      }),
                  quantity: totalQuantity,
                  amount: totalCost,
                  cost: totalCost,
                  status: po.status || '',
                });
              }
            }

            // ACCOUNTS_PAYABLE entry
            if (po.status === 'INVOICED' || po.status === 'PAID')
            {
              entries.push({
                id: `${po.id}-ap`,
                date: invoiceDateStr || orderDateStr || '',
                type: 'ACCOUNTS_PAYABLE',
                poId: po.id || '',
                poNumber: po.orderNumber || '',
                invoiceNumber: po.invoiceNumber,
                supplierId: po.supplierId || '',
                supplierName,
                description: po.invoiceNumber
                    ? this.translate.instant('generalLedger.description.apWithInvoice', {
                      poNumber: po.orderNumber || '',
                      invoiceNumber: po.invoiceNumber
                    })
                    : this.translate.instant('generalLedger.description.ap', {poNumber: po.orderNumber || ''}),
                quantity: totalQuantity,
                amount: po.total || 0,
                status: po.status || '',
              });
            }

            // PAYMENT entry
            if (po.status === 'PAID' && po.jsonData?.paymentAmount)
            {
              const paymentAmount = po.jsonData.paymentAmount || 0;
              let paymentDate = '';
              if (po.jsonData.paymentDate)
              {
                const paymentDateValue = po.jsonData.paymentDate;
                if (typeof paymentDateValue === 'string')
                {
                  if (paymentDateValue.match(/^\d{4}-\d{2}-\d{2}$/))
                  {
                    paymentDate = paymentDateValue;
                  }
                  else
                  {
                    paymentDate = new Date(paymentDateValue).toISOString().split('T')[0];
                  }
                }
              }
              if (!paymentDate)
              {
                paymentDate = orderDateStr;
              }

              if (paymentAmount > 0)
              {
                entries.push({
                  id: `${po.id}-payment`,
                  date: paymentDate,
                  type: 'PAYMENT',
                  poId: po.id || '',
                  poNumber: po.orderNumber || '',
                  invoiceNumber: po.invoiceNumber,
                  supplierId: po.supplierId || '',
                  supplierName,
                  description: po.invoiceNumber
                      ? this.translate.instant('generalLedger.description.poPaymentWithInvoice', {
                        poNumber: po.orderNumber || '',
                        invoiceNumber: po.invoiceNumber
                      })
                      : this.translate.instant('generalLedger.description.poPayment', {poNumber: po.orderNumber || ''}),
                  quantity: 0,
                  amount: paymentAmount,
                  status: 'PAID',
                });
              }
            }
          });

          // Sort by date (newest first)
          entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return entries;
        })
    );
  }

  getTypeColor(type: GLEntryType): string
  {
    switch (type)
    {
      case 'REVENUE':
        return '#047857';
      case 'COST':
        return '#DC2626';
      case 'PAYMENT':
        return '#2563EB';
      case 'EXPENSE':
        return '#DC2626';
      case 'ACCOUNTS_PAYABLE':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  }

  getTypeBackgroundColor(type: GLEntryType): string
  {
    switch (type)
    {
      case 'REVENUE':
        return '#D1FAE5';
      case 'COST':
        return '#FEE2E2';
      case 'PAYMENT':
        return '#DBEAFE';
      case 'EXPENSE':
        return '#FEE2E2';
      case 'ACCOUNTS_PAYABLE':
        return '#FEF3C7';
      default:
        return '#F3F4F6';
    }
  }

  getTypeLabel(type: GLEntryType): string
  {
    switch (type)
    {
      case 'REVENUE':
        return this.translate.instant('generalLedger.type.revenue');
      case 'COST':
        return this.translate.instant('generalLedger.type.cost');
      case 'PAYMENT':
        return this.translate.instant('generalLedger.type.payment');
      case 'EXPENSE':
        return this.translate.instant('generalLedger.type.expense');
      case 'ACCOUNTS_PAYABLE':
        return this.translate.instant('generalLedger.type.ap');
      default:
        return type;
    }
  }
}

