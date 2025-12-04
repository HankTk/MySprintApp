import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { DataService } from './data.service';
import { globalHandlers } from '../utils/global-handlers';

export type SuccessHook = (data: any) => void;
export type ErrorHook = (error: any) => void;
export type CompleteHook = () => void;

export interface ResourceHooks {
  onSuccess?: SuccessHook;
  onError?: ErrorHook;
  onComplete?: CompleteHook;
}

@Injectable({ providedIn: 'root' })
export class ResourceManagementService {

  private data = inject(DataService);
  private snackBar = inject(MatSnackBar);

  protected defaultSuccessHandler(
    data: any,
    isLoading: WritableSignal<boolean>
  ): void {
    isLoading.set(false);
    globalHandlers.next(data);
  }

  protected defaultErrorHandler(
    error: any,
    isLoading: WritableSignal<boolean>,
    message: string
  ): void {
    this.showSnackBar(message, 'error');
    isLoading.set(false);
    globalHandlers.error(error);
  }

  protected defaultCompleteHandler(): void {
    // Default complete handler (can be overridden)
  }

  loadResource(
    resource: string,
    isLoading: WritableSignal<boolean>,
    errorMessage?: string,
    hooks?: ResourceHooks
  ): void {
    isLoading.set(true);
    this.data.get(resource).subscribe({
      next: (data) => {
        // まずデフォルト処理を実行
        this.defaultSuccessHandler(data, isLoading);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onSuccess) {
          hooks.onSuccess(data);
        }
      },
      error: (error) => {
        // まずデフォルト処理を実行
        const message = errorMessage || `Failed to load ${resource}`;
        this.defaultErrorHandler(error, isLoading, message);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // まずデフォルト処理を実行
        this.defaultCompleteHandler();
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onComplete) {
          hooks.onComplete();
        }
      }
    });
  }

  protected defaultCreateSuccessHandler(
    result: any,
    isLoading: WritableSignal<boolean>,
    resource: string,
    successMessage?: string
  ): void {
    isLoading.set(false);
    const message = successMessage || `${resource} created successfully`;
    this.showSnackBar(message, 'success');
    globalHandlers.next(result);
  }

  createResource(
    resource: string,
    data: any,
    isLoading: WritableSignal<boolean>,
    successMessage?: string,
    errorMessage?: string,
    hooks?: ResourceHooks
  ): void {
    isLoading.set(true);
    this.data.post(resource, data).subscribe({
      next: (result) => {
        // まずデフォルト処理を実行
        this.defaultCreateSuccessHandler(result, isLoading, resource, successMessage);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onSuccess) {
          hooks.onSuccess(result);
        }
      },
      error: (error) => {
        // まずデフォルト処理を実行
        const message = errorMessage || `Failed to create ${resource}`;
        this.defaultErrorHandler(error, isLoading, message);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // まずデフォルト処理を実行
        this.defaultCompleteHandler();
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onComplete) {
          hooks.onComplete();
        }
      }
    });
  }

  protected defaultUpdateSuccessHandler(
    result: any,
    isLoading: WritableSignal<boolean>,
    resource: string,
    successMessage?: string
  ): void {
    isLoading.set(false);
    const message = successMessage || `${resource} updated successfully`;
    this.showSnackBar(message, 'success');
    globalHandlers.next(result);
  }

  updateResource(
    resource: string,
    id: string,
    data: any,
    isLoading: WritableSignal<boolean>,
    successMessage?: string,
    errorMessage?: string,
    hooks?: ResourceHooks
  ): void {
    if (!id) {
      console.error(`${resource} ID is missing:`, data);
      return;
    }

    isLoading.set(true);
    this.data.put(resource, id, data).subscribe({
      next: (result) => {
        // まずデフォルト処理を実行
        this.defaultUpdateSuccessHandler(result, isLoading, resource, successMessage);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onSuccess) {
          hooks.onSuccess(result);
        }
      },
      error: (error) => {
        // まずデフォルト処理を実行
        const message = errorMessage || `Failed to update ${resource}: ${JSON.stringify(error)}`;
        this.defaultErrorHandler(error, isLoading, message);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // まずデフォルト処理を実行
        this.defaultCompleteHandler();
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onComplete) {
          hooks.onComplete();
        }
      }
    });
  }

  protected defaultDeleteSuccessHandler(
    isLoading: WritableSignal<boolean>,
    resource: string,
    successMessage?: string
  ): void {
    isLoading.set(false);
    const message = successMessage || `${resource} deleted successfully`;
    this.showSnackBar(message, 'success');
    globalHandlers.next(null);
  }

  deleteResource(
    resource: string,
    id: string,
    isLoading: WritableSignal<boolean>,
    successMessage?: string,
    errorMessage?: string,
    hooks?: ResourceHooks
  ): void {
    isLoading.set(true);
    this.data.delete(resource, id).subscribe({
      next: (result) => {
        // まずデフォルト処理を実行
        this.defaultDeleteSuccessHandler(isLoading, resource, successMessage);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onSuccess) {
          hooks.onSuccess(result);
        }
      },
      error: (error) => {
        // まずデフォルト処理を実行
        const message = errorMessage || `Failed to delete ${resource}: ${JSON.stringify(error)}`;
        this.defaultErrorHandler(error, isLoading, message);
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // まずデフォルト処理を実行
        this.defaultCompleteHandler();
        // その後、hooksが提供されている場合はそれも実行
        if (hooks?.onComplete) {
          hooks.onComplete();
        }
      }
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

}
