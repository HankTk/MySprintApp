import {Injectable, inject, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {SFC, CreateSFCRequest} from '../models/sfc.model';
import {ResourceService} from '../../../shared/services/resource.service';
import {TranslateService} from '@ngx-translate/core';
import {SFCDialogComponent, SFCDialogData} from '../components/sfc-dialog/sfc-dialog.component';
import {
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogData
} from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class SFCService
{
  private apiUrl = 'http://localhost:8080/api/sfcs';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  getSFCs(): Observable<SFC[]>
  {
    return this.http.get<SFC[]>(this.apiUrl);
  }

  getSFC(id: string): Observable<SFC>
  {
    return this.http.get<SFC>(`${this.apiUrl}/${id}`);
  }

  createSFC(sfc: CreateSFCRequest): Observable<SFC>
  {
    return this.http.post<SFC>(this.apiUrl, sfc);
  }

  updateSFC(id: string, sfc: SFC): Observable<SFC>
  {
    return this.http.put<SFC>(`${this.apiUrl}/${id}`, sfc);
  }

  deleteSFC(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadSFCs(isLoading: WritableSignal<boolean>): void
  {
    this.resourceManager.loadResource(
        'sfcs',
        isLoading,
        this.translate.instant('messages.failedToLoad', {resource: 'sfcs'})
    );
  }

  createSFCWithNotification(
      sfcData: CreateSFCRequest,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.createResource(
        'sfcs',
        sfcData,
        isLoading,
        this.translate.instant('messages.sfcCreatedSuccessfully'),
        this.translate.instant('messages.failedToCreateSFC')
    );
  }

  updateSFCWithNotification(
      sfcData: SFC,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.updateResource(
        'sfcs',
        sfcData.id!,
        sfcData,
        isLoading,
        this.translate.instant('messages.sfcUpdatedSuccessfully'),
        this.translate.instant('messages.failedToUpdateSFC')
    );
  }

  deleteSFCWithNotification(
      id: string,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.deleteResource(
        'sfcs',
        id,
        isLoading,
        this.translate.instant('messages.sfcDeletedSuccessfully'),
        this.translate.instant('messages.failedToDeleteSFC')
    );
  }

  openAddSFCDialog(isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(SFCDialogComponent,
        {
          data: {isEdit: false} as SFCDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'create')
      {
        this.createSFCWithNotification(result.sfc, isLoading);
      }
    });
  }

  openEditSFCDialog(sfc: SFC, isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(SFCDialogComponent,
        {
          data: {sfc, isEdit: true} as SFCDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'update')
      {
        this.updateSFCWithNotification(result.sfc, isLoading);
      }
    });
  }

  openDeleteSFCDialog(sfc: SFC, isLoading: WritableSignal<boolean>): void
  {
    const sfcLabel = sfc.sfcNumber || sfc.id || 'SFC';
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
        {
          data: {
            userName: sfcLabel,
            userEmail: ''
          } as DeleteConfirmDialogData,
          width: '500px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result === true)
      {
        this.deleteSFCWithNotification(sfc.id!, isLoading);
      }
    });
  }

  openAddSFCEntry(isLoading: WritableSignal<boolean>): void
  {
    // Navigate to SFC entry page instead of opening dialog
    this.router.navigate(['/sfcs/new']);
  }

  openEditSFCEntry(sfc: SFC, isLoading: WritableSignal<boolean>): void
  {
    // Navigate to SFC entry page instead of opening dialog
    if (sfc.id)
    {
      this.router.navigate(['/sfcs', sfc.id]);
    }
  }

  createSFCFromRMA(rmaId: string): Observable<SFC>
  {
    return this.http.post<SFC>(`${this.apiUrl}/from-rma/${rmaId}`, {});
  }
}

