import { AnalyticsPort } from './analytics.port';

export class StubAnalyticsAdapter implements AnalyticsPort {
  public pageViews = new Array<string>();

  pageView(url: string): void {
    this.pageViews.push(url);
  }
}
