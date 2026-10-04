import { Trans, useLingui } from '@lingui/react/macro';
import type { UpdateMemberProfileData } from '@sel/shared';
import { Button, Card, showToast } from '@sel/ui';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { type FieldValues, type FormState } from 'react-hook-form';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { FormServerErrorAlert } from 'src/components/fields';

export function useSectionEditing() {
  // Undefined until the section is edited once: the Edit button only takes the focus back when the form closes.
  const [editing, setEditing] = useState<boolean>();

  return {
    editing: editing === true,
    returnFocus: editing === false,
    edit: () => setEditing(true),
    close: () => setEditing(false),
  };
}

type ProfileSectionProps = {
  title: React.ReactNode;
  onEdit?: () => void;
  focusEdit?: boolean;
  children: React.ReactNode;
};

export function ProfileSection({ title, onEdit, focusEdit, children }: ProfileSectionProps) {
  const titleId = useId();
  const buttonId = useId();

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2} id={titleId}>
          {title}
        </Card.Title>

        {onEdit && (
          <Card.Action>
            <Button
              id={buttonId}
              variant="ghost"
              size="sm"
              icon="edit"
              autoFocus={focusEdit}
              aria-labelledby={`${buttonId} ${titleId}`}
              onClick={onEdit}
            >
              <Trans>Edit</Trans>
            </Button>
          </Card.Action>
        )}
      </Card.Header>

      <Card.Body>{children}</Card.Body>
    </Card.Root>
  );
}

type ProfileSectionFormProps = {
  formState: FormState<FieldValues>;
  title: React.ReactNode;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (event: React.SubmitEvent) => void;
  children: React.ReactNode;
};

export function ProfileSectionForm({
  formState,
  title,
  onSubmit,
  busy,
  onCancel,
  children,
}: ProfileSectionFormProps) {
  return (
    <form noValidate onSubmit={onSubmit}>
      <Card.Root>
        <Card.Header>
          <Card.Title level={2}>{title}</Card.Title>
        </Card.Header>

        <Card.Body className="stack gap-6">
          {children}
          <FormServerErrorAlert
            error={formState.errors.root}
            title={<Trans>Your changes could not be saved</Trans>}
          />
        </Card.Body>

        <Card.Footer className="justify-end">
          <Button variant="secondary" onClick={onCancel} className="max-sm:grow">
            <Trans>Cancel</Trans>
          </Button>
          <Button type="submit" loading={formState.isSubmitting || busy} className="max-sm:grow">
            <Trans>Save</Trans>
          </Button>
        </Card.Footer>
      </Card.Root>
    </form>
  );
}

type UseUpdateProfileMutationOptions = {
  onSuccess: () => void;
  onError: (error: Error) => void;
};

export function useUpdateProfileMutation({ onSuccess, onError }: UseUpdateProfileMutationOptions) {
  const { data: me } = useSuspenseQuery(queries.session());
  const queryClient = useQueryClient();
  const { t } = useLingui();

  return useMutation({
    mutationFn: (body: UpdateMemberProfileData) => api('PUT', `/members/${me.id}/profile`, { body }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.session());
      showToast(t`Profile updated`);
      onSuccess();
    },
    onError,
  });
}
