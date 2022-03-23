import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import AppForm from '../AppForm.vue';

describe('AppForm', () => {
  it('renders properly', async () => {
    const wrapper = mount(AppForm);

    const buttons = wrapper.findAll<HTMLButtonElement>('button');
    const addButton = buttons.find((item) => item.text() === 'Add');
    const testButton = buttons.find((item) => item.text() === 'Test Alert');
    const saveButton = buttons.find((item) => item.text() === 'Save');

    expect(wrapper.text()).toContain('Alert Message');
    expect(wrapper.text()).toContain('Frequency');
    expect(wrapper.text()).toContain('Email Recipients');
    expect(addButton?.element.textContent).toBe('Add');
    expect(addButton?.element.disabled).toBe(true);
    expect(testButton?.element.textContent).toBe('Test Alert');
    expect(saveButton?.element.textContent?.trim()).toBe('Save');

    await wrapper.find<HTMLTextAreaElement>('textarea').setValue('test message');
    await wrapper.find<HTMLInputElement>('input[type=radio][value=hourly]').setValue();
    await wrapper.find<HTMLInputElement>('input[type=email]').setValue('test@test.com');
    expect(addButton?.element.disabled).toBe(false);
    await addButton?.trigger('click');
    expect(wrapper.findAll<HTMLButtonElement>('button').length).toBe(buttons.length + 1);
  });
});
