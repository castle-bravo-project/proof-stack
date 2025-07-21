import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'

// Mock the entire Gemini service
vi.mock('../../services/geminiService', () => ({
  generateComprehensiveAnalysis: vi.fn(),
  getAIKeyPoints: vi.fn(),
  getAICritique: vi.fn(),
  isApiKeyConfigured: vi.fn(),
  setApiKey: vi.fn(),
  getApiKey: vi.fn(),
  clearApiKey: vi.fn()
}))

describe('Integration Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup default mocks
    const { isApiKeyConfigured, generateComprehensiveAnalysis } = vi.mocked(
      await import('../../services/geminiService')
    )
    
    isApiKeyConfigured.mockReturnValue(true)
    generateComprehensiveAnalysis.mockResolvedValue({
      executiveSummary: {
        overallConfidence: 'High' as const,
        confidenceBreakdown: { high: 5, medium: 2, low: 1 },
        topRecommendations: ['Strengthen authentication', 'Document chain of custody']
      },
      overallConclusion: 'Comprehensive analysis of the submitted evidence reveals strong compliance with Federal Rules of Evidence.',
      analysisSections: [],
      summary: 'Comprehensive analysis of the submitted evidence reveals strong compliance with Federal Rules of Evidence.',
      keyFindings: [
        'Evidence meets FRE 901 authentication requirements',
        'Chain of custody is well-documented',
        'Digital signatures are valid and verifiable'
      ],
      legalAnalysis: {
        admissibility: 88,
        strengths: [
          'Strong digital authentication',
          'Complete chain of custody documentation',
          'Proper metadata preservation'
        ],
        weaknesses: [
          'Minor timestamp discrepancies',
          'Could benefit from additional witness testimony'
        ],
        recommendations: [
          'Obtain additional witness statements',
          'Verify timestamp accuracy with system logs',
          'Consider expert testimony for digital evidence'
        ]
      },
      riskAssessment: {
        overallRisk: 'LOW',
        specificRisks: [
          'Minimal authentication concerns',
          'Low probability of successful challenge'
        ]
      }
    })
  })

  describe('Complete User Workflow', () => {
    it('completes full evidence analysis workflow', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Step 1: Verify initial state
      expect(screen.getByText('ProofStack')).toBeInTheDocument()
      expect(screen.getByText('Evidence Information')).toBeInTheDocument()

      // Step 2: Fill out evidence information
      await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'digital')
      await user.type(
        screen.getByLabelText(/Description/i), 
        'Digital contract with electronic signatures'
      )
      await user.type(
        screen.getByLabelText(/Source/i), 
        'Company email server backup'
      )

      // Step 3: Proceed to questions
      await user.click(screen.getByText('Continue to Assessment'))

      await waitFor(() => {
        expect(screen.getByText(/Question 1 of/)).toBeInTheDocument()
      })

      // Step 4: Answer all questions
      let questionCount = 0
      while (questionCount < 10) { // Limit to prevent infinite loop
        // Check if we're still on a question page
        const questionHeader = screen.queryByText(/Question \d+ of \d+/)
        if (!questionHeader) break

        // Answer the current question
        const radioButtons = screen.getAllByRole('radio')
        if (radioButtons.length > 0) {
          await user.click(radioButtons[0]) // Select first option
        }

        // Try to proceed
        const nextButton = screen.queryByText('Next Question')
        const generateButton = screen.queryByText('Generate Analysis')

        if (nextButton) {
          await user.click(nextButton)
        } else if (generateButton) {
          await user.click(generateButton)
          break
        } else {
          break
        }

        questionCount++
      }

      // Step 5: Verify analysis generation starts
      await waitFor(() => {
        expect(screen.getByText(/Generating Analysis/)).toBeInTheDocument()
      })

      // Step 6: Wait for analysis completion
      await waitFor(() => {
        expect(screen.getByText('Analysis Complete')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Step 7: Verify analysis results are displayed
      expect(screen.getByText(/Comprehensive analysis of the submitted evidence/)).toBeInTheDocument()
      expect(screen.getByText('Evidence meets FRE 901 authentication requirements')).toBeInTheDocument()
      expect(screen.getByText('88%')).toBeInTheDocument() // Admissibility score
      expect(screen.getByText('LOW RISK')).toBeInTheDocument()
    })

    it('handles API key configuration workflow', async () => {
      const { isApiKeyConfigured } = vi.mocked(await import('../../services/geminiService'))
      isApiKeyConfigured.mockReturnValue(false)

      const user = userEvent.setup()
      render(<App />)

      // Complete evidence info
      await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
      await user.type(screen.getByLabelText(/Description/i), 'Test document')
      await user.type(screen.getByLabelText(/Source/i), 'Test source')
      await user.click(screen.getByText('Continue to Assessment'))

      // Answer questions quickly
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

      // Should show API key configuration modal
      await waitFor(() => {
        expect(screen.getByText('Configure Gemini API Key')).toBeInTheDocument()
      })
    })

    it('handles analysis errors gracefully', async () => {
      const { generateComprehensiveAnalysis } = vi.mocked(await import('../../services/geminiService'))
      generateComprehensiveAnalysis.mockRejectedValue(new Error('Network error occurred'))

      const user = userEvent.setup()
      render(<App />)

      // Complete workflow to analysis
      await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
      await user.type(screen.getByLabelText(/Description/i), 'Test document')
      await user.type(screen.getByLabelText(/Source/i), 'Test source')
      await user.click(screen.getByText('Continue to Assessment'))

      // Answer questions
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

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/Analysis Failed/)).toBeInTheDocument()
        expect(screen.getByText(/Network error occurred/)).toBeInTheDocument()
      })

      // Should show retry button
      expect(screen.getByText('Retry Analysis')).toBeInTheDocument()
    })

    it('allows restarting the assessment', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Complete full workflow
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

      await waitFor(() => {
        expect(screen.getByText('Analysis Complete')).toBeInTheDocument()
      })

      // Click new assessment
      await user.click(screen.getByText('New Assessment'))

      // Should be back to evidence information
      await waitFor(() => {
        expect(screen.getByText('Evidence Information')).toBeInTheDocument()
      })

      // Form should be cleared
      expect(screen.getByLabelText(/Evidence Type/i)).toHaveValue('')
      expect(screen.getByLabelText(/Description/i)).toHaveValue('')
      expect(screen.getByLabelText(/Source/i)).toHaveValue('')
    })
  })

  describe('Data Persistence', () => {
    it('maintains form data during navigation', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Fill evidence info
      await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'digital')
      await user.type(screen.getByLabelText(/Description/i), 'Test evidence')
      await user.type(screen.getByLabelText(/Source/i), 'Test source')
      await user.click(screen.getByText('Continue to Assessment'))

      // Answer first question
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(4)
      })
      await user.click(screen.getAllByRole('radio')[1]) // Select second option

      // Go to next question
      await user.click(screen.getByText('Next Question'))

      // Go back to previous question
      await user.click(screen.getByText('Previous Question'))

      // Verify answer is preserved
      await waitFor(() => {
        const radioButtons = screen.getAllByRole('radio')
        expect(radioButtons[1]).toBeChecked()
      })
    })
  })

  describe('Accessibility', () => {
    it('maintains proper focus management', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Tab through form elements
      await user.tab()
      expect(screen.getByLabelText(/Evidence Type/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/Description/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/Source/i)).toHaveFocus()
    })

    it('provides proper ARIA labels and roles', () => {
      render(<App />)

      // Check for proper form labels
      expect(screen.getByLabelText(/Evidence Type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Source/i)).toBeInTheDocument()

      // Check for proper button roles
      expect(screen.getByRole('button', { name: /Continue to Assessment/i })).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders initial page quickly', () => {
      const startTime = performance.now()
      render(<App />)
      const endTime = performance.now()

      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('handles large amounts of data efficiently', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Fill form with large text
      const largeText = 'A'.repeat(10000)
      
      await user.selectOptions(screen.getByLabelText(/Evidence Type/i), 'document')
      await user.type(screen.getByLabelText(/Description/i), largeText)
      await user.type(screen.getByLabelText(/Source/i), 'Test source')

      // Should handle large input without issues
      expect(screen.getByLabelText(/Description/i)).toHaveValue(largeText)
    })
  })
})
