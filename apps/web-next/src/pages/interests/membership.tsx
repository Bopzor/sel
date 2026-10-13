import { Trans, useLingui } from '@lingui/react/macro';
import type { AddInterestMemberBody, Interest } from '@sel/shared';
import { Button, Card, Dialog, showToast } from '@sel/ui';
import { QueryClient, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { FormServerErrorAlert, submitWithMutation, TextAreaField } from 'src/components/fields';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

export function InterestedButton({ interest }: { interest: Interest }) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" icon="add" onClick={() => setOpen(true)}>
        <Trans>Add</Trans>
      </Button>

      <Dialog.Root open={open} onClose={() => setOpen(false)}>
        <Dialog.Content closeLabel={t`Close`}>
          <Dialog.Header>
            <Dialog.Title>
              <Trans>Add “{interest.label}” to your interests</Trans>
            </Dialog.Title>
            <Dialog.Description>
              <Trans>The other members will see you in this interest, with your note.</Trans>
            </Dialog.Description>
          </Dialog.Header>

          <JoinForm interest={interest} onClose={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

function JoinForm({ interest, onClose }: { interest: Interest; onClose: () => void }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: useZodResolver(noteSchema),
    defaultValues: { description: '' },
  });

  const mutation = useMutation({
    mutationFn: (body: AddInterestMemberBody) => api('PUT', `/interests/${interest.id}/join`, { body }),
    onSuccess: async () => {
      await invalidateInterests(queryClient);
      showToast(t`“${interest.label}” added to your interests`);
      onClose();
    },
    onError: useFormApiError(form),
  });

  return (
    <form noValidate onSubmit={submitWithMutation(form, mutation)} className="contents">
      <Dialog.Body className="stack gap-6">
        <TextAreaField
          control={form.control}
          name="description"
          label={<Trans>Note (optional)</Trans>}
          hint={<Trans>What you can share, what you're looking for, your level…</Trans>}
          rows={5}
        />

        <FormServerErrorAlert
          error={form.formState.errors.root}
          title={<Trans>This interest couldn't be added</Trans>}
        />
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="submit" loading={form.formState.isSubmitting}>
          <Trans>Add</Trans>
        </Button>
        <Button variant="secondary" onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
      </Dialog.Footer>
    </form>
  );
}

export function ParticipationCard({ interest }: { interest: Interest }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const [editing, setEditing] = useState(false);

  const member = interest.members.find(({ id }) => id === me.id);

  if (!member) {
    return <NoteFormCard interest={interest} action="join" />;
  }

  if (editing) {
    return (
      <NoteFormCard
        interest={interest}
        action="edit"
        note={member.description}
        onClose={() => setEditing(false)}
      />
    );
  }

  return <JoinedInterestCard interest={interest} note={member.description} onEdit={() => setEditing(true)} />;
}

const noteSchema = z.object({
  description: z
    .string()
    .trim()
    .transform((description) => description || undefined),
});

type NoteFormCardProps = {
  interest: Interest;
  action: 'join' | 'edit';
  note?: string;
  onClose?: () => void;
};

function NoteFormCard({ interest, action, note, onClose }: NoteFormCardProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: useZodResolver(noteSchema),
    defaultValues: { description: note ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (body: AddInterestMemberBody) => api('PUT', `/interests/${interest.id}/${action}`, { body }),
    onSuccess: async () => {
      await invalidateInterests(queryClient);
      showToast(action === 'join' ? t`“${interest.label}” added to your interests` : t`Your note was saved`);
      onClose?.();
    },
    onError: useFormApiError(form),
  });

  return (
    <Card.Root>
      <form noValidate onSubmit={submitWithMutation(form, mutation)} className="contents">
        {action === 'join' && (
          <Card.Header>
            <Card.Title level={2}>
              <Trans>Add to my interests</Trans>
            </Card.Title>
            <Card.Description>
              <Trans>The other members will see you in this interest, with your note.</Trans>
            </Card.Description>
          </Card.Header>
        )}

        <Card.Body className="stack gap-4">
          <TextAreaField
            control={form.control}
            name="description"
            label={<Trans>Note (optional)</Trans>}
            hint={<Trans>What you can share, what you're looking for, your level…</Trans>}
            rows={5}
          />

          <FormServerErrorAlert
            error={form.formState.errors.root}
            title={
              action === 'join' ? (
                <Trans>This interest couldn't be added</Trans>
              ) : (
                <Trans>Your note couldn't be saved</Trans>
              )
            }
          />
        </Card.Body>

        <Card.Footer>
          <Button type="submit" loading={form.formState.isSubmitting} className="grow">
            {action === 'join' ? <Trans>Add</Trans> : <Trans>Save</Trans>}
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={onClose} className="grow">
              <Trans>Cancel</Trans>
            </Button>
          )}
        </Card.Footer>
      </form>
    </Card.Root>
  );
}

type JoinedInterestCardProps = {
  interest: Interest;
  note?: string;
  onEdit: () => void;
};

function JoinedInterestCard({ interest, note, onEdit }: JoinedInterestCardProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api('PUT', `/interests/${interest.id}/leave`),
    onSuccess: () => invalidateInterests(queryClient),
    onError: () => showToast(t`This interest couldn't be removed`),
  });

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          <Trans>In your interests</Trans>
        </Card.Title>
      </Card.Header>

      <Card.Body className="stack gap-4">
        {note ? (
          <blockquote className="border-l-2 pl-3 whitespace-pre-line">{note}</blockquote>
        ) : (
          <p className="text-body-sm text-muted">
            <Trans>You haven't written a note.</Trans>
          </p>
        )}
      </Card.Body>

      <Card.Footer>
        <Button variant="secondary" disabled={mutation.isPending} onClick={onEdit} className="grow">
          {note ? <Trans>Edit my note</Trans> : <Trans>Add a note</Trans>}
        </Button>
        <Button variant="ghost" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Trans>No longer interested</Trans>
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}

// The session and the member pages list the member's interests.
async function invalidateInterests(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries(queries.listInterests()),
    queryClient.invalidateQueries(queries.session()),
    queryClient.invalidateQueries({ queryKey: ['members'] }),
  ]);
}
