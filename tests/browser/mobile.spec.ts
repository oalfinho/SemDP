import { test, expect } from '@playwright/test'

test('mobile: navegação, detalhes, agenda, formulário e acessibilidade básica', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/?demo=1')
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({ path: 'docs/screenshots/mobile-inicio.png', fullPage: true })
  await page
    .getByRole('navigation', { name: 'Navegação pelo celular' })
    .getByRole('button', { name: 'Disciplinas' })
    .click()
  await page.getByRole('button', { name: /Banco de Dados/ }).click()
  await expect(page.getByRole('heading', { name: 'Banco de Dados' })).toBeVisible()
  await page.getByRole('button', { name: 'Editar', exact: true }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('Nome da disciplina').fill('Novo nome')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('alert')).toContainText('demonstração')
  await expect(page.getByLabel('Nome da disciplina')).toHaveValue('Novo nome')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Registrar falta', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('Quantidade de aulas', { exact: true }).fill('1')
  await page.getByLabel('Observação').fill('Teste de preenchimento')
  await expect(page.getByLabel('Quantidade de aulas', { exact: true })).toHaveValue('1')
  await page.screenshot({ path: 'docs/screenshots/mobile-falta.png', fullPage: true })
  await page.keyboard.press('Escape')
  await page
    .getByRole('navigation', { name: 'Navegação pelo celular' })
    .getByRole('button', { name: 'Agenda' })
    .click()
  await expect(page.getByRole('heading', { name: 'Agenda de aulas' })).toBeVisible()
  await page.screenshot({ path: 'docs/screenshots/mobile-agenda.png', fullPage: true })
  await page
    .getByRole('navigation', { name: 'Navegação pelo celular' })
    .getByRole('button', { name: 'Ajustes' })
    .click()
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible()
  await page.getByRole('button', { name: '+ Novo semestre' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(errors).toEqual([])
})

test('desktop: dashboard e simulador', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 })
  await page.goto('/?demo=1')
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  await page.getByLabel('Aulas que pretende perder').fill('20')
  await expect(page.getByText(/Você ficaria/)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({ path: 'docs/screenshots/desktop-inicio.png', fullPage: true })
})

test('320px: não cria rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/?demo=1')
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
