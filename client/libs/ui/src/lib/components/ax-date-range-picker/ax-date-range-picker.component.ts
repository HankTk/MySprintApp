import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, TemplateRef, ViewContainerRef, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { PortalModule } from '@angular/cdk/portal';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface PredefinedRange {
  label: string;
  getValue: () => { start: Date; end: Date };
}

/**
 * Enhanced date range picker component with two-month calendar view and predefined ranges
 */
@Component({
  selector: 'ax-date-range-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    OverlayModule,
    PortalModule
  ],
  templateUrl: './ax-date-range-picker.component.html',
  styleUrls: ['./ax-date-range-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxDateRangePickerComponent),
      multi: true
    },
    { provide: DateAdapter, useClass: NativeDateAdapter }
  ]
})
export class AxDateRangePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private cdr = inject(ChangeDetectorRef);
  private overlayRef: OverlayRef | null = null;

  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() error = false;
  @Input() hint?: string;
  @Input() startDate?: Date | null;
  @Input() endDate?: Date | null;
  @Input() showPredefinedRanges = true;
  @Input() inline = false;
  @Input() popoverMode = false; // New mode: single input field with popover
  @Output() startDateChange = new EventEmitter<Date | null>();
  @Output() endDateChange = new EventEmitter<Date | null>();
  @Output() rangeChange = new EventEmitter<DateRange>();

  @ViewChild('calendarTemplate', { read: TemplateRef }) calendarTemplate?: TemplateRef<any>;
  @ViewChild('inputTrigger', { read: ElementRef }) inputTrigger?: ElementRef;

  // Calendar view state
  calendarStartDate: Date = new Date();
  calendarEndDate: Date = new Date();
  tempStartDate: Date | null = null;
  tempEndDate: Date | null = null;
  isCalendarOpen = false;
  
  // Month/Year selection state
  viewMode: 'calendar' | 'month' | 'year' | 'multi-year' = 'calendar';
  selectedMonthIndex: number | null = null; // For month selection (0-11)
  selectedYear: number | null = null; // For year selection
  selectedYearRange: { start: number; end: number } | null = null; // For multi-year view
  yearRange: number[] = []; // Years to display in year picker
  activeCalendarIndex: number = 0; // Which calendar (0 or 1) is being modified

  // Predefined ranges
  predefinedRanges: PredefinedRange[] = [
    {
      label: 'Today',
      getValue: () => {
        const today = new Date();
        return { start: new Date(today), end: new Date(today) };
      }
    },
    {
      label: 'Last 7 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { start, end };
      }
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { start, end };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start, end };
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start, end };
      }
    },
    {
      label: 'Month To Date',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start, end: today };
      }
    },
    {
      label: 'Year To Date',
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 1);
        return { start, end: today };
      }
    }
  ];

  private onChange = (value: DateRange) => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.initializeCalendar();
    this.initializeYearRange();
    if (this.startDate || this.endDate) {
      this.tempStartDate = this.startDate || null;
      this.tempEndDate = this.endDate || null;
    }
  }
  
  initializeYearRange(): void {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 25; // 25 years back
    const endYear = currentYear + 25; // 25 years forward
    this.yearRange = [];
    for (let year = startYear; year <= endYear; year++) {
      this.yearRange.push(year);
    }
  }

  initializeCalendar(): void {
    const today = new Date();
    this.calendarStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.calendarEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  }

  writeValue(value: DateRange | null): void {
    if (value) {
      this.startDate = value.start;
      this.endDate = value.end;
      this.tempStartDate = value.start;
      this.tempEndDate = value.end;
      if (value.start) {
        this.calendarStartDate = new Date(value.start.getFullYear(), value.start.getMonth(), 1);
        this.calendarEndDate = new Date(value.start.getFullYear(), value.start.getMonth() + 1, 1);
      }
    }
  }

  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onStartDateChange(date: Date | null): void {
    this.startDate = date;
    this.tempStartDate = date;
    this.startDateChange.emit(date);
    this.updateValue();
    this.onTouched();
  }

  onEndDateChange(date: Date | null): void {
    this.endDate = date;
    this.tempEndDate = date;
    this.endDateChange.emit(date);
    this.updateValue();
    this.onTouched();
  }

  updateValue(): void {
    const value = { start: this.startDate || null, end: this.endDate || null };
    this.onChange(value);
    this.rangeChange.emit(value);
  }

  // Calendar date selection
  onCalendarDateSelect(date: Date): void {
    if (!this.tempStartDate || (this.tempStartDate && this.tempEndDate)) {
      // Start new selection
      this.tempStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      this.tempEndDate = null;
    } else if (this.tempStartDate && !this.tempEndDate) {
      // Complete selection
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (selectedDate < this.tempStartDate) {
        this.tempEndDate = new Date(this.tempStartDate);
        this.tempStartDate = selectedDate;
      } else {
        this.tempEndDate = selectedDate;
      }
    }
  }

  isDateInRange(date: Date): boolean {
    if (!this.tempStartDate || !this.tempEndDate) return false;
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(this.tempStartDate.getFullYear(), this.tempStartDate.getMonth(), this.tempStartDate.getDate());
    const end = new Date(this.tempEndDate.getFullYear(), this.tempEndDate.getMonth(), this.tempEndDate.getDate());
    return checkDate >= start && checkDate <= end;
  }

  isDateStart(date: Date): boolean {
    if (!this.tempStartDate) return false;
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(this.tempStartDate.getFullYear(), this.tempStartDate.getMonth(), this.tempStartDate.getDate());
    return checkDate.getTime() === start.getTime();
  }

  isDateEnd(date: Date): boolean {
    if (!this.tempEndDate) return false;
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(this.tempEndDate.getFullYear(), this.tempEndDate.getMonth(), this.tempEndDate.getDate());
    return checkDate.getTime() === end.getTime();
  }

  // Predefined range selection
  selectPredefinedRange(range: PredefinedRange): void {
    const { start, end } = range.getValue();
    this.tempStartDate = new Date(start);
    this.tempEndDate = new Date(end);
    // Set calendar to show the start month and next month
    this.calendarStartDate = new Date(start.getFullYear(), start.getMonth(), 1);
    this.calendarEndDate = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    // Auto-apply predefined ranges
    this.applySelection();
  }

  // Calendar navigation
  previousMonth(): void {
    this.calendarStartDate = new Date(this.calendarStartDate.getFullYear(), this.calendarStartDate.getMonth() - 1, 1);
    this.calendarEndDate = new Date(this.calendarStartDate.getFullYear(), this.calendarStartDate.getMonth() + 1, 1);
  }

  nextMonth(): void {
    this.calendarStartDate = new Date(this.calendarStartDate.getFullYear(), this.calendarStartDate.getMonth() + 1, 1);
    this.calendarEndDate = new Date(this.calendarStartDate.getFullYear(), this.calendarStartDate.getMonth() + 1, 1);
  }
  
  // Month/Year selection methods - Material UI style
  openMonthSelection(calendarIndex: number): void {
    this.activeCalendarIndex = calendarIndex;
    // Material UI: Clicking month/year opens month view first
    this.viewMode = 'month';
    this.selectedMonthIndex = calendarIndex === 0 ? this.calendarStartDate.getMonth() : this.calendarEndDate.getMonth();
    this.selectedYear = calendarIndex === 0 ? this.calendarStartDate.getFullYear() : this.calendarEndDate.getFullYear();
  }
  
  openYearSelection(calendarIndex: number): void {
    this.activeCalendarIndex = calendarIndex;
    const currentYear = calendarIndex === 0 ? this.calendarStartDate.getFullYear() : this.calendarEndDate.getFullYear();
    this.selectedYear = currentYear;
    // Show multi-year view first (Material UI behavior)
    this.viewMode = 'multi-year';
    this.initializeYearRangeForMultiYear(currentYear);
  }
  
  initializeYearRangeForMultiYear(centerYear: number): void {
    // Material UI shows 24 years per view (e.g., 2020-2043)
    const startYear = Math.floor(centerYear / 24) * 24;
    const endYear = startYear + 23;
    this.yearRange = [];
    for (let year = startYear; year <= endYear; year++) {
      this.yearRange.push(year);
    }
    this.selectedYearRange = { start: startYear, end: endYear };
  }
  
  navigateYearRange(direction: 'prev' | 'next'): void {
    if (!this.selectedYearRange) return;
    const rangeSize = 24;
    if (direction === 'prev') {
      this.selectedYearRange = {
        start: this.selectedYearRange.start - rangeSize,
        end: this.selectedYearRange.end - rangeSize
      };
    } else {
      this.selectedYearRange = {
        start: this.selectedYearRange.start + rangeSize,
        end: this.selectedYearRange.end + rangeSize
      };
    }
    this.yearRange = [];
    for (let year = this.selectedYearRange.start; year <= this.selectedYearRange.end; year++) {
      this.yearRange.push(year);
    }
  }
  
  selectMonth(monthIndex: number): void {
    this.selectedMonthIndex = monthIndex;
    // If year is already selected, apply immediately
    if (this.selectedYear !== null) {
      this.applyYearAndMonthSelection();
    }
    // If no year selected yet, the month selection will stay and user can click year to select
  }
  
  selectYear(year: number): void {
    this.selectedYear = year;
    // After selecting year in multi-year view, go to month selection (Material UI behavior)
    this.viewMode = 'month';
    // Preserve the month selection if it was already made
    if (this.selectedMonthIndex === null) {
      this.selectedMonthIndex = this.activeCalendarIndex === 0 ? this.calendarStartDate.getMonth() : this.calendarEndDate.getMonth();
    }
    // If month was already selected, apply the selection
    if (this.selectedMonthIndex !== null) {
      this.applyYearAndMonthSelection();
    }
  }
  
  applyYearAndMonthSelection(): void {
    if (this.selectedYear === null || this.selectedMonthIndex === null) return;
    
    if (this.activeCalendarIndex === 0) {
      this.calendarStartDate = new Date(this.selectedYear, this.selectedMonthIndex, 1);
      this.calendarEndDate = new Date(this.selectedYear, this.selectedMonthIndex + 1, 1);
    } else {
      this.calendarEndDate = new Date(this.selectedYear, this.selectedMonthIndex, 1);
      // Ensure calendarStartDate is one month before calendarEndDate
      this.calendarStartDate = new Date(this.selectedYear, this.selectedMonthIndex - 1, 1);
    }
    this.viewMode = 'calendar';
    this.selectedYear = null;
    this.selectedMonthIndex = null;
    this.selectedYearRange = null;
  }
  
  backToCalendar(): void {
    this.viewMode = 'calendar';
    this.selectedMonthIndex = null;
    this.selectedYear = null;
    this.selectedYearRange = null;
  }
  
  backFromYearToMonth(): void {
    if (this.viewMode === 'multi-year') {
      this.viewMode = 'month';
    } else if (this.viewMode === 'year') {
      this.viewMode = 'month';
    }
  }
  
  isSelectedYearInRange(year: number): boolean {
    return this.selectedYear === year;
  }
  
  getYearRangeLabel(): string {
    if (!this.selectedYearRange) return '';
    return `${this.selectedYearRange.start} - ${this.selectedYearRange.end}`;
  }
  
  // Reset view mode when opening popover or initializing
  resetViewMode(): void {
    this.viewMode = 'calendar';
  }
  
  getMonthNames(): string[] {
    return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  }
  
  getMonthNamesFull(): string[] {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }
  
  getCurrentMonth(calendarIndex: number): number {
    return calendarIndex === 0 ? this.calendarStartDate.getMonth() : this.calendarEndDate.getMonth();
  }
  
  getCurrentYear(calendarIndex: number): number {
    return calendarIndex === 0 ? this.calendarStartDate.getFullYear() : this.calendarEndDate.getFullYear();
  }
  
  isSelectedMonth(monthIndex: number, calendarIndex: number): boolean {
    return this.getCurrentMonth(calendarIndex) === monthIndex;
  }
  
  isSelectedYear(year: number, calendarIndex: number): boolean {
    return this.getCurrentYear(calendarIndex) === year;
  }

  // Apply and Cancel
  applySelection(): void {
    this.startDate = this.tempStartDate;
    this.endDate = this.tempEndDate;
    this.startDateChange.emit(this.startDate);
    this.endDateChange.emit(this.endDate);
    this.updateValue();
    this.isCalendarOpen = false;
    if (this.popoverMode && this.overlayRef) {
      this.closePopover();
    }
  }

  cancelSelection(): void {
    this.tempStartDate = this.startDate || null;
    this.tempEndDate = this.endDate || null;
    this.isCalendarOpen = false;
    if (this.popoverMode && this.overlayRef) {
      this.closePopover();
    }
  }

  clearSelection(): void {
    this.tempStartDate = null;
    this.tempEndDate = null;
    this.startDate = null;
    this.endDate = null;
    this.startDateChange.emit(null);
    this.endDateChange.emit(null);
    this.updateValue();
  }

  getFormattedDateRange(): string {
    if (!this.tempStartDate && !this.tempEndDate) {
      return '';
    }
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    if (this.tempStartDate && this.tempEndDate) {
      return `${formatDate(this.tempStartDate)} - ${formatDate(this.tempEndDate)}`;
    } else if (this.tempStartDate) {
      return formatDate(this.tempStartDate);
    }
    return '';
  }

  getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  }

  getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add days from previous month to fill the week
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    // Add days from next month to fill the week (ensure we have 6 weeks = 42 days)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }
    
    return days;
  }

  isCurrentMonth(date: Date, calendarDate: Date): boolean {
    return date.getMonth() === calendarDate.getMonth() && date.getFullYear() === calendarDate.getFullYear();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCustomRange(): boolean {
    if (!this.tempStartDate || !this.tempEndDate) {
      return false;
    }
    return !this.predefinedRanges.some(r => {
      const range = r.getValue();
      return range.start.toDateString() === this.tempStartDate?.toDateString() && 
             range.end.toDateString() === this.tempEndDate?.toDateString();
    });
  }

  // Popover methods
  openPopover(event?: Event): void {
    if (this.disabled || this.isCalendarOpen) {
      return;
    }

    if (this.overlayRef) {
      this.closePopover();
      return;
    }

    const triggerElement = this.inputTrigger?.nativeElement || (event?.target as HTMLElement)?.closest('.ax-date-range-input-wrapper');
    if (!triggerElement) {
      return;
    }

    // Create overlay position strategy
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 4
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -4
        }
      ]);

    // Create overlay
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'date-range-picker-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'date-range-picker-overlay-panel',
      disposeOnNavigation: true
    });

    // Close on backdrop click
    this.overlayRef.backdropClick().subscribe(() => {
      this.cancelSelection();
    });

    // Attach template portal
    if (!this.calendarTemplate) {
      console.error('Calendar template not found');
      return;
    }

    const portal = new TemplatePortal(this.calendarTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);
    this.isCalendarOpen = true;

    // Initialize temp dates
    this.tempStartDate = this.startDate || null;
    this.tempEndDate = this.endDate || null;
    
    // Reset view mode to calendar
    this.resetViewMode();

    // Force change detection
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  closePopover(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.isCalendarOpen = false;
    }
  }

  getDateRangeDisplay(): string {
    if (!this.startDate && !this.endDate) {
      return '';
    }
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    if (this.startDate && this.endDate) {
      return `${formatDate(this.startDate)} - ${formatDate(this.endDate)}`;
    } else if (this.startDate) {
      return `From ${formatDate(this.startDate)}`;
    } else if (this.endDate) {
      return `Until ${formatDate(this.endDate)}`;
    }
    return '';
  }

  ngOnDestroy(): void {
    this.closePopover();
  }
}
