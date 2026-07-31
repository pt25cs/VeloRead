import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByText('VeloRead')).toBeInTheDocument()
  })

  it('renders the single-column layout without tabs or sidebar', () => {
    render(<App />)

    // Verify no tab or sidebar constructs exist
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.queryByRole('tablist')).toBeNull()
    expect(screen.queryByRole('tabpanel')).toBeNull()
    expect(document.querySelector('aside')).toBeNull()

    // Verify new layout structure is present
    expect(document.querySelector('.app-shell')).toBeInTheDocument()
    expect(document.querySelector('.app-shell__content')).toBeInTheDocument()
  })
})
