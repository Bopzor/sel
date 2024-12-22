import { MembersSort, MemberStatus, RequestAnswer, RequestStatus, TransactionStatus } from '@sel/shared';

import { Flatten } from 'src/utils/types';

import { useIntl } from './intl-provider';
import translations from './lang/fr.json';

export const TranslateMembersSort = createTranslateEnum<MembersSort>('membersSort');
export const TranslateMembersStatus = createTranslateEnum<MemberStatus>('memberStatus');
export const TranslateRequestStatus = createTranslateEnum<RequestStatus>('requestStatus');
export const TranslateRequestAnswer = createTranslateEnum<RequestAnswer['answer']>('requestAnswer');
export const TranslateTransactionStatus = createTranslateEnum<TransactionStatus>('transactionStatus');

type EnumKey = Extract<keyof Flatten<typeof translations>, `enums.${string}`>;
type Enum = EnumKey extends `enums.${infer S}.${string}` ? S : never;

function createTranslateEnum<Value extends string>(type: Enum) {
  return (props: { value: Value }) => {
    const intl = useIntl();
    return <>{intl.formatMessage({ id: `enums.${type}.${props.value}` })}</>;
  };
}
