export interface NotificationCreator {
  shouldSend(memberId: string): boolean;
  title(): string;
  titleTrimmed(): string;
  content(): string;
}
