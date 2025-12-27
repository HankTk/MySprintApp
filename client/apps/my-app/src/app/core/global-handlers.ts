export const globalHandlers =
    {
      next: (v: any) => console.log('[Next]', v),
      error: (e: any) => console.error('[Global Error]', e),
      complete: () =>
      {
        console.log('[Complete]');
      }
    };
