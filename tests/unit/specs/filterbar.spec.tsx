import { computed, h } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import mitt from 'mitt'
import { mount } from '@vue/test-utils'
import ListviewFilterbar from '@/components/ListviewFilterbar.vue'
import { useProvideLvStore } from '@/useLvStore'
import { createListviewWrapper, wait } from '../helpers'

const DATE1 = new Date('2021/01/01 09:30:00')
const DATE2 = new Date('2021/06/01 09:30:00')

function _mount(comp: any, props = {}, store = { filterModel: {} }) {
  const wrapper = mount({
    render: () => h(comp, props),
    setup() {
      useProvideLvStore(store as any)
    },
  })
  wrapper.__store = store
  return wrapper
}

describe('Filterbar layout', () => {
  it('filterbarFold', () => {
    const wrapper = _mount(ListviewFilterbar, { filterbarFold: false })
    expect(wrapper.element.classList.contains('lv-filterbar--fold')).toBe(false)
  })
  it('filterbarFoldable', () => {
    const wrapper = _mount(ListviewFilterbar, { filterbarFoldable: false })
    expect(wrapper.find('.lv-filterbar--fold').exists()).toBe(false)
    expect(wrapper.find('.lv-filterbar__action-more').exists()).toBe(false)
  })
})

describe('Filter buttons', () => {
  it('normal', async () => {
    const filterButtons: any = [
      { text: 'default' },
      { type: 'primary', icon: 'el-icon-edit', text: 'primary' },
      { type: 'success', icon: 'el-icon-check', text: 'success' },
      { type: 'info', icon: 'el-icon-message', text: 'info' },
      { type: 'warning', icon: 'el-icon-star-off', text: 'warning' },
      { type: 'danger', icon: 'el-icon-delete', text: 'danger' },
    ]
    const wrapper = _mount(ListviewFilterbar, { filterButtons })
    const buttons = wrapper
      .findComponent({ name: 'FilterbarButtons' })
      .findAllComponents({ name: 'ElButton' })
    expect(buttons.length).toBe(filterButtons.length)
  })

  it('dropdown', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterButtons: [
        {
          type: 'primary',
          text: '下拉按钮',
          children: [
            { icon: 'el-icon-circle-plus-outline', text: '菜单1' },
            { icon: 'el-icon-remove-outline', text: '菜单2' },
          ],
        },
      ],
    })
    const buttons = wrapper
      .findComponent({ name: 'FilterbarButtons' })
      .findAllComponents({ name: 'ElButton' })
    const dropdownItem = wrapper.findAllComponents({
      name: 'ElDropdownItem',
    })
    expect(buttons.length).toBe(1)
    expect(dropdownItem.length).toBe(2)
  })

  it('click', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    const mockFn3 = vi.fn()
    const filterButtons = [
      { text: 'btn', click: mockFn1 },
      {
        text: 'btn',
        children: [
          { text: '菜单1', click: mockFn2 },
          { text: '菜单2', click: mockFn3 },
        ],
      },
    ]
    const wrapper = _mount(ListviewFilterbar, { filterButtons })
    const button = wrapper
      .findComponent({ name: 'FilterbarButtons' })
      .findComponent({ name: 'ElButton' })
    const childrenButtons = wrapper
      .findComponent({ name: 'FilterbarButtons' })
      .findAllComponents({ name: 'ElDropdownItem' })
    button.trigger('click')
    childrenButtons[0].trigger('click')
    childrenButtons[1].trigger('click')
    expect(mockFn1.call.length).toBe(1)
    expect(mockFn2.call.length).toBe(1)
    expect(mockFn3.call.length).toBe(1)
  })

  it('other buttons render type', () => {
    const filterButtons = [
      () => <div class="function-type">text</div>,
      <div class="jsx-type">text</div>,
      () => computed(() => <div class="ref-function-type">text</div>),
      computed(() => <div class="ref-jsx-type">text</div>),
    ]
    const wrapper = _mount(ListviewFilterbar, { filterButtons })
    expect(wrapper.find('div.function-type').exists()).toBe(true)
    expect(wrapper.find('div.jsx-type').exists()).toBe(true)
    expect(wrapper.find('div.ref-function-type').exists()).toBe(true)
    expect(wrapper.find('div.ref-jsx-type').exists()).toBe(true)
  })
})

describe('Filter fields', () => {
  it('Field label render', () => {
    const wrapper = _mount(ListviewFilterbar, {
      searchButton: false,
      resetButton: false,
      filterFields: [{ type: 'label', label: 'label text' }],
    })
    expect(wrapper.find('div.el-form-item__label').element.innerHTML).toBe(
      'label text'
    )
  })

  it('Fields: text', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'text', model: 'text' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldText' }).length).toBe(1)
  })

  it('Fields: number', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'number', model: 'number' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldNumber' }).length).toBe(1)
  })

  it('Fields: date', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'date', model: 'date' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldDate' }).length).toBe(1)
  })

  it('Fields: dateRange', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'dateRange', model: 'dateRange' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldDateRange' }).length).toBe(1)
  })

  it('Fields: timeSelect', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'timeSelect', model: 'timeSelect' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldTimeSelect' }).length).toBe(
      1
    )
  })

  it('Fields: timePicker', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'timePicker', model: 'timePicker' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldTimePicker' }).length).toBe(
      1
    )
  })

  it('Fields: timePickerRange', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'timePickerRange', model: 'timePickerRange' }],
    })
    expect(
      wrapper.findAllComponents({ name: 'FieldTimePickerRange' }).length
    ).toBe(1)
  })

  it('Fields: dateTime', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'dateTime', model: 'dateTime' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldDateTime' }).length).toBe(1)
  })

  it('Fields: dateTimeRange', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'dateTimeRange', model: 'dateTimeRange' }],
    })
    expect(
      wrapper.findAllComponents({ name: 'FieldDateTimeRange' }).length
    ).toBe(1)
  })

  it('Fields: select', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'select', model: 'select' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldSelect' }).length).toBe(1)
  })

  it('Fields: cascader', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'cascader', model: 'cascader' }],
    })
    expect(wrapper.findAllComponents({ name: 'FieldCascader' }).length).toBe(1)
  })

  it('Invalid fields render', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'text_x' }, { type: 'number_x' }],
    })
    expect(wrapper.findAll('.lv-field').length).toBe(0)
  })

  it('Group fields render', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [
        [
          { type: 'text', model: 'text' },
          { type: 'number', model: 'number' },
        ],
      ],
    })
    expect(wrapper.find('.lv-field-group').exists()).toBe(true)
  })

  it('Filter fields set value', () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [
        { type: 'text', model: 'text' },
        { type: 'number', model: 'number' },
        { type: 'date', model: 'date' },
        { type: 'dateRange', model: 'dateRange' },
        { type: 'timeSelect', model: 'timeSelect' },
        { type: 'timePicker', model: 'timePicker' },
        { type: 'timePickerRange', model: 'timePickerRange' },
        { type: 'dateTime', model: 'dateTime' },
        { type: 'dateTimeRange', model: 'dateTimeRange' },
        { type: 'select', model: 'select' },
        { type: 'cascader', model: 'cascader' },
      ],
    })

    const _findVm = (name: string): any => wrapper.findComponent({ name }).vm
    _findVm('FieldText').value = 'text'
    _findVm('FieldNumber').value = 9527
    _findVm('FieldDate').value = DATE1
    _findVm('FieldDateRange').value = [DATE1, DATE2]
    _findVm('FieldTimeSelect').value = '10:00'
    _findVm('FieldTimePicker').value = DATE1
    _findVm('FieldTimePickerRange').value = [DATE1, DATE2]
    _findVm('FieldDateTime').value = DATE1
    _findVm('FieldDateTimeRange').value = [DATE1, DATE2]
    _findVm('FieldSelect').value = 'option1'
    _findVm('FieldCascader').value = [1, 2, 3, 4]

    const fakeStore = wrapper.__store
    expect(fakeStore.filterModel).toStrictEqual({
      text: 'text',
      number: 9527,
      date: DATE1,
      dateRange: [DATE1, DATE2],
      timeSelect: '10:00',
      timePicker: DATE1,
      timePickerRange: [DATE1, DATE2],
      dateTime: DATE1,
      dateTimeRange: [DATE1, DATE2],
      select: 'option1',
      cascader: [1, 2, 3, 4],
    })
  })

  it('other fields render type', () => {
    const filterFields = [
      {
        label: 'label',
        model: 'text',
        render: () => <input class="object-type" />,
      },
      () => <input class="function-type" />,
      <input class="vnode-type" />,
      () => computed(() => <input class="ref-function-type" />),
      computed(() => <input class="ref-vnode-type" />),
    ]
    const wrapper = _mount(ListviewFilterbar, {
      filterFields,
    })
    expect(wrapper.find('.lv-field input.object-type').exists()).toBe(true)
    expect(wrapper.find('.lv-field input.function-type').exists()).toBe(true)
    expect(wrapper.find('.lv-field input.vnode-type').exists()).toBe(true)
    expect(wrapper.find('.lv-field input.ref-function-type').exists()).toBe(
      true
    )
    expect(wrapper.find('.lv-field input.ref-vnode-type').exists()).toBe(true)
  })

  it('effect', async () => {
    const emitter = mitt<any>()
    const { wrapper } = await createListviewWrapper({
      filterModel: { selectField: '' },
      filterFields: [
        {
          type: 'select',
          model: 'selectField',
          options: [],
          effect: ({ fieldRef, filterModel }: any) => {
            emitter.on('custom-update-input', (value: string) => {
              filterModel.selectField = value
              fieldRef.value.options = [
                { label: value, value },
                { label: 'other-label', value: 'other-value' },
              ]
            })
          },
        },
      ],
    })
    const optionText = 'newOptionText'
    emitter.emit('custom-update-input', optionText)
    await wait(100)
    const $filterbar = wrapper.findComponent({ name: 'ListviewFilterbar' })
    const $options = $filterbar.findAllComponents({ name: 'ElOption' })
    expect($options.length).toBe(2)
    expect($options.at(0)?.element.textContent?.trim()).toBe(optionText)
    expect($options.at(0)?.element.classList.contains('selected')).toBeTruthy()
  })
})

describe('Filter fields default value', () => {
  const wrapper = _mount(
    ListviewFilterbar,
    {
      filterFields: [
        { type: 'text', model: 'text' },
        { type: 'number', model: 'number' },
        { type: 'date', model: 'date' },
        { type: 'dateRange', model: 'dateRange' },
        { type: 'timeSelect', model: 'timeSelect' },
        { type: 'timePicker', model: 'timePicker' },
        { type: 'timePickerRange', model: 'timePickerRange' },
        { type: 'dateTime', model: 'dateTime' },
        { type: 'dateTimeRange', model: 'dateTimeRange' },
        { type: 'select', model: 'select' },
        { type: 'cascader', model: 'cascader' },
      ],
    },
    {
      filterModel: {
        text: 'text',
        number: 9527,
        date: DATE1,
        dateRange: [DATE1, DATE2],
        timeSelect: '10:00',
        timePicker: DATE1,
        timePickerRange: [DATE1, DATE2],
        dateTime: DATE1,
        dateTimeRange: [DATE1, DATE2],
        select: 'option1',
        cascader: [1, 2, 3, 4],
      },
    }
  )
  const _findVm = (name: string): any => wrapper.findComponent({ name }).vm

  it('text', () => expect(_findVm('FieldText').value).toBe('text'))

  it('number', () => expect(_findVm('FieldNumber').value).toBe(9527))

  it('date', () => expect(_findVm('FieldDate').value).toBe(DATE1))

  it('dateRange', () =>
    expect(_findVm('FieldDateRange').value).toEqual([DATE1, DATE2]))

  it('timeSelect', () => expect(_findVm('FieldTimeSelect').value).toBe('10:00'))

  it('timePicker', () => expect(_findVm('FieldTimePicker').value).toBe(DATE1))

  it('timePickerRange', () =>
    expect(_findVm('FieldTimePickerRange').value).toEqual([DATE1, DATE2]))

  it('dateTime', () => expect(_findVm('FieldDateTime').value).toBe(DATE1))

  it('dateTimeRange', () =>
    expect(_findVm('FieldDateTimeRange').value).toEqual([DATE1, DATE2]))

  it('select', () => expect(_findVm('FieldSelect').value).toBe('option1'))

  it('cascader', () =>
    expect(_findVm('FieldCascader').value).toEqual([1, 2, 3, 4]))
})

describe('Filter fields options resolve', () => {
  const options = [
    { label: 'option1', value: 'option1' },
    { label: 'option2', value: 'option2' },
  ]

  it('array', async () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [
        { type: 'select', model: 'select', options },
        { type: 'cascader', model: 'cascader', options },
      ],
    })
    await wait()
    expect(wrapper.findAllComponents({ name: 'ElOption' }).length).toBe(
      options.length
    )
    expect(
      wrapper.findComponent({ name: 'ElCascader' }).vm.$props.options
    ).toEqual(options)
  })

  it('promise', async () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [
        {
          type: 'select',
          model: 'select',
          options: Promise.resolve(options),
        },
        {
          type: 'cascader',
          model: 'cascader',
          options: Promise.resolve(options),
        },
      ],
    })
    await wait()
    expect(wrapper.findAllComponents({ name: 'ElOption' }).length).toBe(
      options.length
    )
    expect(
      wrapper.findComponent({ name: 'ElCascader' }).vm.$props.options
    ).toEqual(options)
  })

  it('function return array', async () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [
        { type: 'select', model: 'select', options: () => options },
        { type: 'cascader', model: 'cascader', options: () => options },
      ],
    })
    await wait()
    expect(wrapper.findAllComponents({ name: 'ElOption' }).length).toBe(
      options.length
    )
    expect(
      wrapper.findComponent({ name: 'ElCascader' }).vm.$props.options
    ).toEqual(options)
  })

  it('function return promise', async () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [
        {
          type: 'select',
          model: 'select',
          options: () => Promise.resolve(options),
        },
        {
          type: 'cascader',
          model: 'cascader',
          options: () => Promise.resolve(options),
        },
      ],
    })
    await wait()
    expect(wrapper.findAllComponents({ name: 'ElOption' }).length).toBe(
      options.length
    )
    expect(
      wrapper.findComponent({ name: 'ElCascader' }).vm.$props.options
    ).toEqual(options)
  })

  it('invalid options', async () => {
    const wrapper = _mount(ListviewFilterbar, {
      filterFields: [{ type: 'select', model: 'select', options: 'options' }],
    })
    await wait()
    expect(wrapper.findAllComponents({ name: 'ElOption' }).length).toBe(0)
  })
})
