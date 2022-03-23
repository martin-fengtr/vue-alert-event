async async
<template>
  <div class="p-6 flex flex-col flex-1 items-center">
    <form
      class="relative mt-24 p-8 max-w-[768px] w-1/3 border border-slate-300 rounded-lg overflow-hidden text-sm flex flex-col items-stretch gap-6"
    >
      <p class="text-xl text-center font-semibold">Email Alert</p>

      <div class="font-medium flex flex-col items-stretch gap-1">
        <label for="message">Alert Message</label>
        <textarea class="input" id="message" name="message" v-model.trim="message"></textarea>
        <ErrorMessage>{{ messageError }}</ErrorMessage>
      </div>

      <div class="flex flex-col items-stretch gap-1">
        <div class="flex items-center gap-4">
          <label class="font-medium">Frequency</label>
          <div class="flex items-center">
            <input
              class="accent-slate-700 cursor-pointer"
              type="radio"
              id="hourly"
              name="frequency"
              value="hourly"
              v-model="frequency"
            />
            <label for="hourly" class="pl-2 text-base cursor-pointer">Hourly</label>
          </div>
          <div class="flex items-center">
            <input
              class="accent-slate-700 cursor-pointer"
              type="radio"
              id="daily"
              name="frequency"
              value="daily"
              v-model="frequency"
            />
            <label for="daily" class="pl-2 text-base cursor-pointer">Daily</label>
          </div>
        </div>
        <ErrorMessage>{{ frequencyError }}</ErrorMessage>
      </div>

      <div class="flex flex-col items-stretch gap-1">
        <div class="flex items-end gap-2">
          <label class="font-medium flex flex-1 flex-col items-stretch gap-1">
            Email Recipients
            <input type="email" class="input" v-model.trim="email" />
          </label>
          <button type="button" class="btn" :disabled="!canAdd" @click="addRecipient">Add</button>
        </div>
        <ErrorMessage>{{ emailError }}</ErrorMessage>
      </div>

      <div class="-mt-4 flex flex-col items-stretch gap-1">
        <div class="flex justify-between items-center gap-1" v-for="recipient in recipients" :key="recipient">
          <span class="text-base">{{ recipient }}</span>
          <button class="p-2 font-semibold cursor-pointer" @click="() => deleteRecipient(recipient)">❌</button>
        </div>
        <ErrorMessage>{{ recipientsError }}</ErrorMessage>
      </div>
      <div class="flex justify-end items-center gap-2">
        <button type="button" class="btn min-w-[100px]" @click="onTest">Test Alert</button>
        <button type="button" class="btn min-w-[100px] bg-slate-400 text-white disabled:!text-white/60" @click="onSave">
          Save
        </button>
      </div>

      <div
        v-if="isTesting || isSaving"
        class="absolute inset-0 bg-black/30 text-white flex justify-center items-center"
      >
        <span v-if="isTesting">Testing...</span>
        <span v-if="isSaving">Saving...</span>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useField, useForm } from 'vee-validate';
import * as yup from 'yup';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { useEvent } from '@/hooks/UseEvent.hook';

const { resetForm } = useForm();
const { isTesting, isSaving, test, save } = useEvent(resetForm);

const {
  value: message,
  errorMessage: messageError,
  validate: validateMessage,
} = useField<string>(
  'message',
  yup
    .string()
    .required('Message is a required field')
    .min(1, 'Message should be at least 1 character long')
    .max(1000, 'Message should not be exceed 1000 characters'),
);

const {
  value: frequency,
  errorMessage: frequencyError,
  validate: validateFrequency,
} = useField<'hourly' | 'daily'>('frequency', yup.string().required('Frequency is a required field'));

const {
  value: recipients,
  errorMessage: recipientsError,
  validate: validateRecipients,
  setValue: setRecipients,
} = useField<string[]>(
  'recipients',
  yup
    .array()
    .of(yup.string().email('Recipient should be valid email address'))
    .required('Recipients is a required field')
    .min(1, 'At least 1 recipient is required')
    .max(10, 'Limited 10 recipients'),
  {
    initialValue: [],
  },
);

const {
  value: email,
  errorMessage: emailError,
  resetField: resetEmailField,
} = useField<string>(
  'email',
  computed(() =>
    yup
      .string()
      .required('Email is a required field')
      .email('Invalid email address')
      .test('unique', 'Already existing email address', (value) => {
        return !value || !recipients.value.includes(value);
      })
      .test('limit', 'Maximum recipients count reached', (value) => {
        return !value || recipients.value.length < 10;
      }),
  ),
);

const canAdd = computed((): boolean => !!email.value && !emailError.value);

const addRecipient = () => {
  setRecipients([...recipients.value, email.value]);
  resetEmailField();
};

const deleteRecipient = (email: string) => {
  setRecipients(recipients.value.filter((item) => item !== email));
};

const onTest = async () => {
  const { valid: validMessage } = await validateMessage();
  const { valid: validFrequency } = await validateFrequency();
  const { valid: validRecipients } = await validateRecipients();

  if (validMessage && validFrequency && validRecipients) {
    test({
      message: message.value,
      frequency: frequency.value,
      recipients: recipients.value,
    });
  }
};

const onSave = async () => {
  const { valid: validMessage } = await validateMessage();
  const { valid: validFrequency } = await validateFrequency();
  const { valid: validRecipients } = await validateRecipients();

  if (validMessage && validFrequency && validRecipients) {
    save({
      message: message.value,
      frequency: frequency.value,
      recipients: recipients.value,
    });
  }
};
</script>

<style lang="postcss" scoped>
.btn {
  @apply p-2 border border-slate-300 hover:border-slate-400 active:border-slate-500 focus:border-slate-400 disabled:border-slate-200 disabled:text-slate-400 rounded font-semibold cursor-pointer;
}
.input {
  @apply p-2 border border-slate-300 rounded hover:border-slate-400 focus:border-slate-400 outline-none;
}
</style>
