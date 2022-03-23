import { ref } from 'vue';

interface FormData {
  message: string;
  frequency: 'hourly' | 'daily';
  recipients: string[];
}

export interface UseEventHookInterface {
  isTesting?: boolean;
  isSaving?: boolean;
  test: (data: FormData) => void;
  save: (data: FormData) => void;
}

export const useEvent = (complete: () => void) => {
  const isTesting = ref<boolean>(false);
  const isSaving = ref<boolean>(false);

  const test = ({ message, frequency, recipients }: FormData) => {
    isTesting.value = true;

    fetch(`${import.meta.env.VITE_API_URL}/events/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, frequency, recipients }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          console.log('Test successfully', res.data);
        } else {
          console.error('Test failed', res.message);
        }
      })
      .catch((error) => {
        console.error('Test failed', error);
      })
      .finally(() => {
        isTesting.value = false;
      });
  };

  const save = ({ message, frequency, recipients }: FormData) => {
    isSaving.value = true;

    fetch(`${import.meta.env.VITE_API_URL}/events/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, frequency, recipients }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          console.log('Save successfully', res.data);
          complete();
        } else {
          console.error('Save failed', res.message);
        }
      })
      .catch((error) => {
        console.error('Save failed', error);
      })
      .finally(() => {
        isSaving.value = false;
      });
  };

  return {
    isTesting,
    isSaving,
    test,
    save,
  };
};
