import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createListviewWrapper, wait } from '../helpers'
import Listview from '@/Listview'
import ListviewHeader from '@/components/ListviewHeader.vue'
import ListviewContainer from '@/ListviewContainer'

describe('height', () => {
  it('full height', async () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })

    const { wrapper } = await createListviewWrapper({
      autoload: false,
      usePage: false,
    })

    await wait()
    expect(wrapper.find('.lv-wrapper').element.style.height).toBe('800px')

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 500,
    })
    window.dispatchEvent(new Event('resize'))
    await wait()
    expect(wrapper.find('.lv-wrapper').element.style.height).toBe('500px')
  })

  it('auto height', async () => {
    const { wrapper } = await createListviewWrapper({
      autoload: false,
      usePage: false,
      fullHeight: false,
    })
    expect(wrapper.find('.lv-wrapper').element.style?.height).toBeFalsy()
  })

  it('specify height', async () => {
    const { wrapper } = await createListviewWrapper({
      autoload: false,
      usePage: false,
      height: 500,
    })
    expect(wrapper.find('.lv-wrapper').element.style.height).toBe('500px')
  })
})

describe('listview header', () => {
  it('title', () => {
    const headerTitle = 'headerTitle'
    const wrapper = mount(ListviewHeader, {
      propsData: { headerTitle },
    })
    expect(wrapper?.text()).toMatch(headerTitle)
  })

  it('nav', async () => {
    const wrapper = mount(ListviewHeader, {
      propsData: {
        headerNav: ['home', { text: 'list', to: '/list' }],
      },
    })
    const items = wrapper.findAll('.el-breadcrumb__item')
    expect(items.length).toBe(2)
    expect(
      items.at(0).find('.el-breadcrumb__inner')?.element?.textContent.trim()
    ).toBe('home')
    expect(
      items.at(1).find('.el-breadcrumb__inner')?.element?.textContent.trim()
    ).toBe('list')
  })
})

describe('contentMessage', () => {
  it('string', async () => {
    const contentMessage = 'message text'
    const { wrapper } = await createListviewWrapper({
      autoload: false,
      contentMessage,
    })
    const messageBlock = wrapper.find('.lv-message')
    expect(messageBlock.find('.lv-message__text')?.text()).toMatch(
      contentMessage
    )
  })

  it('object', async () => {
    const contentMessage: any = {
      type: 'info',
      text: 'message text',
    }

    const { wrapper } = await createListviewWrapper({
      autoload: false,
      contentMessage,
    })
    const messageBlock = wrapper.find('.lv-message')
    expect(messageBlock.find('.lv-message__text')?.text()).toMatch(
      contentMessage.text
    )
  })
})

describe('row class name', () => {
  it('row string class', async () => {
    const { wrapper } = await createListviewWrapper({
      requestHandler: () => ({
        result: { items: [{}], total: 1 },
        is_success: true,
      }),
      contentAttrs: { rowClassName: 'row-view-class' },
    })
    expect(
      wrapper.findAll('.el-table__body-wrapper .el-table__row.row-view-class')
        .length
    ).toBe(1)
  })

  it('row func class', async () => {
    const { wrapper } = await createListviewWrapper({
      requestHandler: () => ({
        result: { items: [{}], total: 1 },
        is_success: true,
      }),
      contentAttrs: {
        rowClassName: () => 'row-view-class-fn',
      },
    })
    expect(
      wrapper.findAll(
        '.el-table__body-wrapper .el-table__row.row-view-class-fn'
      ).length
    ).toBe(1)
  })
})

describe('listview footer', () => {
  it('pager off', async () => {
    const { wrapper } = await createListviewWrapper({ usePage: false })
    expect(wrapper.find('.lv-pager').exists()).toBeFalsy()
  })

  it('pager on left', async () => {
    const { wrapper } = await createListviewWrapper({ pagePosition: 'left' })
    expect(wrapper.find('.lv-footer__left .lv-pager').exists()).toBe(true)
    expect(wrapper.find('.lv-footer__right .lv-pager').exists()).toBe(false)
  })

  it('pager on right', async () => {
    const { wrapper } = await createListviewWrapper({
      pagePosition: 'right',
    })
    expect(wrapper.find('.lv-footer__left .lv-pager').exists()).toBe(false)
    expect(wrapper.find('.lv-footer__right .lv-pager').exists()).toBe(true)
  })
})

describe('listview container', () => {
  it('header title', () => {
    const wrapper = mount({
      components: { ListviewContainer, Listview },
      template:
        '<ListviewContainer>' +
        '<Listview header-title="title1" />' +
        '<Listview headerTitle="title2" />' +
        '</ListviewContainer>',
    })
    expect(wrapper.findAll('div.lvc-tab').length).toBe(2)
    expect(wrapper.findAll('div.lvc-tab').at(0).element.textContent).toBe(
      'title1'
    )
    expect(wrapper.findAll('div.lvc-tab').at(1).element.textContent).toBe(
      'title2'
    )
  })

  it('tab content switch', async () => {
    const wrapper = mount({
      components: { ListviewContainer, Listview },
      template:
        '<ListviewContainer>' +
        '<div class="content1" header-title="title1" />' +
        '<Listview header-title="title2" />' +
        '</ListviewContainer>',
    })
    expect(wrapper.find('div.content1').exists()).toBe(true)
    expect(wrapper.find('div.lv-wrapper').exists()).toBe(false)
    await (wrapper.findAll('div.lvc-tab').at(1).element as HTMLElement).click()
    expect(wrapper.find('div.content1').exists()).toBe(false)
    expect(wrapper.find('div.lv-wrapper').exists()).toBe(true)
  })
})

describe('slots', () => {
  const genSlots = (names: string[]) =>
    names.reduce((result, name) => {
      result[name] = <div class={name}>{name}</div>
      return result
    }, {} as any)

  it('basic block slots', () => {
    const slots = genSlots(['header', 'filterbar', 'content', 'footer'])
    const wrapper = mount(Listview, { slots })
    expect(wrapper.find('.header').exists()).toBeTruthy()
    expect(wrapper.find('.filterbar').exists()).toBeTruthy()
    expect(wrapper.find('.content').exists()).toBeTruthy()
    expect(wrapper.find('.footer').exists()).toBeTruthy()
  })

  it('filterbar slots', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })
    const slots = genSlots([
      'filterbar-top',
      'filterbar-left',
      'filterbar-right',
      'filterbar-bottom',
      'prepend-submit',
      'append-submit',
      'prepend-more',
      'append-more',
    ])
    const wrapper = mount(Listview, {
      slots,
      props: { filterFields: [{ type: 'text' }] },
    })
    expect(wrapper.find('.filterbar-top').exists()).toBeTruthy()
    expect(wrapper.find('.filterbar-left').exists()).toBeTruthy()
    expect(wrapper.find('.filterbar-right').exists()).toBeTruthy()
    expect(wrapper.find('.filterbar-bottom').exists()).toBeTruthy()
    expect(wrapper.find('.prepend-submit').exists()).toBeTruthy()
    expect(wrapper.find('.append-submit').exists()).toBeTruthy()
    expect(wrapper.find('.prepend-more').exists()).toBeTruthy()
    expect(wrapper.find('.append-more').exists()).toBeTruthy()
  })

  it('content empty slot', () => {
    const slots = genSlots(['content-empty'])
    const wrapper = mount(Listview, { slots })
    expect(wrapper.find('.content-empty').exists()).toBeTruthy()
  })

  it('footer slots', () => {
    const slots = genSlots(['footer-left', 'footer-center', 'footer-right'])
    const wrapper = mount(Listview, { slots })
    expect(wrapper.find('.footer-left').exists()).toBeTruthy()
    expect(wrapper.find('.footer-center').exists()).toBeTruthy()
    expect(wrapper.find('.footer-right').exists()).toBeTruthy()
  })
})
