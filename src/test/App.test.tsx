import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'

// Mock the Gemini service
vi.mock('../../services/geminiService', () => ({
  generateComprehensiveAnalysis: vi.fn().mockResolvedValue({
    summary: 'Test analysis summary',
    keyFindings: ['Finding 1', 'Finding 2'],
    legalAnalysis: {
      admissibility: 85,
      strengths: ['Strong authentication'],
      weaknesses: ['Minor chain of custody gap'],
      recommendations: ['Obtain additional documentation']
    },
    riskAssessment: {
      overallRisk: 'LOW',
      specificRisks: ['Minimal authentication concerns']
    }
  }),
  getAIKeyPoints: vi.fn().mockResolvedValue(['Key point 1', 'Key point 2']),
  getAICritique: vi.fn().mockResolvedValue('This is a test critique'),
  isApiKeyConfigured: vi.fn().mockReturnValue(true),
  setApiKey: vi.fn(),
  getApiKey: vi.fn().mockReturnValue('test-key'),
  clearApiKey: vi.fn()
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main header', () => {
    render(<App />)
    
    expect(screen.getByText('ProofStack')).toBeInTheDocument()
    expect(screen.getByText('Legal Evidence Analysis Platform')).toBeInTheDocument()
  })

  it('displays the evidence information form initially', () => {
    render(<App />)
    
    expect(screen.getByText('Evidence Information')).toBeInTheDocument()
    expect(screen.getByLabelText(/Evidence Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Source/i)).toBeInTheDocument()
  })

  it('allows user to fill out evidence information', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const typeSelect = screen.getByLabelText(/Evidence Type/i)
    const descriptionInput = screen.getByLabelText(/Description/i)
    const sourceInput = screen.getByLabelText(/Source/i)
    
    await user.selectOptions(typeSelect, 'document')
    await user.type(descriptionInput, 'Test document evidence')
    await user.type(sourceInput, 'Test source')
    
    expect(typeSelect).toHaveValue('document')
    expect(descriptionInput).toHaveValue('Test document evidence')
    expect(sourceInput).toHaveValue('Test source')
  })

  it('proceeds to questions after evidence info is complete', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Fill out evidence information
    await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
    await user.type(screen.getByLabelText(/Description/i), 'Test document')
    await user.type(screen.getByLabelText(/Source/i), 'Test source')
    
    // Click continue
    const continueButton = screen.getByText('Continue to Assessment')
    await user.click(continueButton)
    
    // Should now show questions
    await waitFor(() => {
      expect(screen.getByText(/Question \d+ of \d+/)).toBeInTheDocument()
    })
  })

  it('navigates through questions correctly', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Complete evidence info and proceed to questions
    await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
    await user.type(screen.getByLabelText(/Description/i), 'Test document')
    await user.type(screen.getByLabelText(/Source/i), 'Test source')
    await user.click(screen.getByText('Continue to Assessment'))
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/)).toBeInTheDocument()
    })
    
    // Answer first question
    const firstOption = screen.getAllByRole('radio')[0]
    await user.click(firstOption)
    
    // Click next
    const nextButton = screen.getByText('Next Question')
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Question 2 of/)).toBeInTheDocument()
    })
  })

  it('allows going back to previous questions', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate to questions
    await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
    await user.type(screen.getByLabelText(/Description/i), 'Test document')
    await user.type(screen.getByLabelText(/Source/i), 'Test source')
    await user.click(screen.getByText('Continue to Assessment'))
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/)).toBeInTheDocument()
    })
    
    // Answer and go to next question
    await user.click(screen.getAllByRole('radio')[0])
    await user.click(screen.getByText('Next Question'))
    
    await waitFor(() => {
      expect(screen.getByText(/Question 2 of/)).toBeInTheDocument()
    })
    
    // Go back
    const backButton = screen.getByText('Previous Question')
    await user.click(backButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/)).toBeInTheDocument()
    })
  })

  it('generates analysis after completing all questions', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Complete evidence info
    await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
    await user.type(screen.getByLabelText(/Description/i), 'Test document')
    await user.type(screen.getByLabelText(/Source/i), 'Test source')
    await user.click(screen.getByText('Continue to Assessment'))
    
    // Answer all questions (simplified - just answer first few)
    for (let i = 0; i < 3; i++) {
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(4)
      })
      
      await user.click(screen.getAllByRole('radio')[0])
      
      const nextButton = screen.queryByText('Next Question')
      const generateButton = screen.queryByText('Generate Analysis')
      
      if (nextButton) {
        await user.click(nextButton)
      } else if (generateButton) {
        await user.click(generateButton)
        break
      }
    }
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Generating Analysis/)).toBeInTheDocument()
    })
  })

  it('displays analysis results', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Complete the flow to get to analysis
    await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
    await user.type(screen.getByLabelText(/Description/i), 'Test document')
    await user.type(screen.getByLabelText(/Source/i), 'Test source')
    await user.click(screen.getByText('Continue to Assessment'))
    
    // Answer questions and generate analysis
    for (let i = 0; i < 3; i++) {
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(4)
      })
      
      await user.click(screen.getAllByRole('radio')[0])
      
      const nextButton = screen.queryByText('Next Question')
      const generateButton = screen.queryByText('Generate Analysis')
      
      if (nextButton) {
        await user.click(nextButton)
      } else if (generateButton) {
        await user.click(generateButton)
        break
      }
    }
    
    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Check for analysis content
    expect(screen.getByText('Test analysis summary')).toBeInTheDocument()
    expect(screen.getByText('Finding 1')).toBeInTheDocument()
    expect(screen.getByText('Finding 2')).toBeInTheDocument()
  })

  it('handles analysis errors gracefully', async () => {
    const { generateComprehensiveAnalysis } = await import('../../services/geminiService')
    vi.mocked(generateComprehensiveAnalysis).mockRejectedValue(new Error('API Error'))
    
    const user = userEvent.setup()
    render(<App />)
    
    // Complete flow to analysis
    await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
    await user.type(screen.getByLabelText(/Description/i), 'Test document')
    await user.type(screen.getByLabelText(/Source/i), 'Test source')
    await user.click(screen.getByText('Continue to Assessment'))
    
    // Answer questions and generate analysis
    for (let i = 0; i < 3; i++) {
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(4)
      })
      
      await user.click(screen.getAllByRole('radio')[0])
      
      const nextButton = screen.queryByText('Next Question')
      const generateButton = screen.queryByText('Generate Analysis')
      
      if (nextButton) {
        await user.click(nextButton)
      } else if (generateButton) {
        await user.click(generateButton)
        break
      }
    }
    
    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Analysis Failed/)).toBeInTheDocument()
    })
  })

  it('allows starting over after analysis', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Complete full flow
    await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
    await user.type(screen.getByLabelText(/Description/i), 'Test document')
    await user.type(screen.getByLabelText(/Source/i), 'Test source')
    await user.click(screen.getByText('Continue to Assessment'))
    
    // Complete questions and analysis
    for (let i = 0; i < 3; i++) {
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(4)
      })
      
      await user.click(screen.getAllByRole('radio')[0])
      
      const nextButton = screen.queryByText('Next Question')
      const generateButton = screen.queryByText('Generate Analysis')
      
      if (nextButton) {
        await user.click(nextButton)
      } else if (generateButton) {
        await user.click(generateButton)
        break
      }
    }
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument()
    })
    
    // Click start over
    const startOverButton = screen.getByText('New Assessment')
    await user.click(startOverButton)
    
    // Should be back to evidence info
    await waitFor(() => {
      expect(screen.getByText('Evidence Information')).toBeInTheDocument()
    })
  })
})
