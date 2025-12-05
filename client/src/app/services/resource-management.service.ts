import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
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
  private translate = inject(TranslateService);

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
        // Execute default processing first
        this.defaultSuccessHandler(data, isLoading);
        // Then execute hooks if provided
        if (hooks?.onSuccess) {
          hooks.onSuccess(data);
        }
      },
      error: (error) => {
        // Execute default processing first
        const message = errorMessage || this.translate.instant('messages.failedToLoad', { resource });
        this.defaultErrorHandler(error, isLoading, message);
        // Then execute hooks if provided
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // Execute default processing first
        this.defaultCompleteHandler();
        // Then execute hooks if provided
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
    const message = successMessage || this.translate.instant('messages.resourceCreatedSuccessfully', { resource });
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
        // Execute default processing first
        this.defaultCreateSuccessHandler(result, isLoading, resource, successMessage);
        // Then execute hooks if provided
        if (hooks?.onSuccess) {
          hooks.onSuccess(result);
        }
      },
      error: (error) => {
        // Execute default processing first
        const message = errorMessage || this.translate.instant('messages.failedToCreateResource', { resource });
        this.defaultErrorHandler(error, isLoading, message);
        // Then execute hooks if provided
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // Execute default processing first
        this.defaultCompleteHandler();
        // Then execute hooks if provided
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
    const message = successMessage || this.translate.instant('messages.resourceUpdatedSuccessfully', { resource });
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
        // Execute default processing first
        this.defaultUpdateSuccessHandler(result, isLoading, resource, successMessage);
        // Then execute hooks if provided
        if (hooks?.onSuccess) {
          hooks.onSuccess(result);
        }
      },
      error: (error) => {
        // Execute default processing first
        const message = errorMessage || this.translate.instant('messages.failedToUpdateResource', { resource });
        this.defaultErrorHandler(error, isLoading, message);
        // Then execute hooks if provided
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // Execute default processing first
        this.defaultCompleteHandler();
        // Then execute hooks if provided
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
    const message = successMessage || this.translate.instant('messages.resourceDeletedSuccessfully', { resource });
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
        // Execute default processing first
        this.defaultDeleteSuccessHandler(isLoading, resource, successMessage);
        // Then execute hooks if provided
        if (hooks?.onSuccess) {
          hooks.onSuccess(result);
        }
      },
      error: (error) => {
        // Execute default processing first
        const message = errorMessage || this.translate.instant('messages.failedToDeleteResource', { resource });
        this.defaultErrorHandler(error, isLoading, message);
        // Then execute hooks if provided
        if (hooks?.onError) {
          hooks.onError(error);
        }
      },
      complete: () => {
        // Execute default processing first
        this.defaultCompleteHandler();
        // Then execute hooks if provided
        if (hooks?.onComplete) {
          hooks.onComplete();
        }
      }
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    const closeLabel = this.translate.instant('messages.close');
    this.snackBar.open(message, closeLabel, {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

}
