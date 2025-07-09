import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
    ComplianceScore,
    LoadingState,
    ProgressBar,
    RiskLevel,
    StatusBadge
} from '../../components/common/StatusIndicators'

describe('StatusIndicators Components', () => {
  describe('ComplianceScore', () => {
    it('renders high compliance score correctly', () => {
      render(<ComplianceScore score={95} />)
      
      expect(screen.getByText('95%')).toBeInTheDocument()
      expect(screen.getByText('Excellent Compliance')).toBeInTheDocument()
    })

    it('renders medium compliance score correctly', () => {
      render(<ComplianceScore score={75} />)
      
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('Good Compliance')).toBeInTheDocument()
    })

    it('renders low compliance score correctly', () => {
      render(<ComplianceScore score={45} />)
      
      expect(screen.getByText('45%')).toBeInTheDocument()
      expect(screen.getByText('Needs Improvement')).toBeInTheDocument()
    })

    it('applies correct CSS classes for different scores', () => {
      const { rerender } = render(<ComplianceScore score={95} />)
      let scoreElement = screen.getByText('95%')
      expect(scoreElement).toHaveClass('text-green-400')
      
      rerender(<ComplianceScore score={75} />)
      scoreElement = screen.getByText('75%')
      expect(scoreElement).toHaveClass('text-yellow-400')
      
      rerender(<ComplianceScore score={45} />)
      scoreElement = screen.getByText('45%')
      expect(scoreElement).toHaveClass('text-red-400')
    })

    it('shows detailed breakdown when provided', () => {
      const breakdown = [
        { category: 'Authentication', score: 90 },
        { category: 'Chain of Custody', score: 80 }
      ]
      
      render(<ComplianceScore score={85} breakdown={breakdown} />)
      
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('90%')).toBeInTheDocument()
      expect(screen.getByText('Chain of Custody')).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
    })
  })

  describe('RiskLevel', () => {
    it('renders low risk correctly', () => {
      render(<RiskLevel level="LOW" />)
      
      expect(screen.getByText('LOW RISK')).toBeInTheDocument()
      expect(screen.getByText('LOW RISK')).toHaveClass('text-green-300')
    })

    it('renders medium risk correctly', () => {
      render(<RiskLevel level="MEDIUM" />)
      
      expect(screen.getByText('MEDIUM RISK')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM RISK')).toHaveClass('text-yellow-300')
    })

    it('renders high risk correctly', () => {
      render(<RiskLevel level="HIGH" />)
      
      expect(screen.getByText('HIGH RISK')).toBeInTheDocument()
      expect(screen.getByText('HIGH RISK')).toHaveClass('text-red-300')
    })

    it('shows risk factors when provided', () => {
      const factors = ['Authentication concerns', 'Chain of custody gaps']
      
      render(<RiskLevel level="MEDIUM" factors={factors} />)
      
      expect(screen.getByText('Authentication concerns')).toBeInTheDocument()
      expect(screen.getByText('Chain of custody gaps')).toBeInTheDocument()
    })
  })

  describe('ProgressBar', () => {
    it('renders progress bar with correct percentage', () => {
      render(<ProgressBar progress={75} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '75')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })

    it('shows percentage when enabled', () => {
      render(<ProgressBar progress={60} showPercentage={true} />)
      
      expect(screen.getByText('60%')).toBeInTheDocument()
    })

    it('hides percentage when disabled', () => {
      render(<ProgressBar progress={60} showPercentage={false} />)
      
      expect(screen.queryByText('60%')).not.toBeInTheDocument()
    })

    it('applies different colors', () => {
      const { rerender } = render(<ProgressBar progress={50} color="primary" />)
      let progressFill = document.querySelector('.bg-brand-primary')
      expect(progressFill).toBeInTheDocument()
      
      rerender(<ProgressBar progress={50} color="success" />)
      progressFill = document.querySelector('.bg-green-600')
      expect(progressFill).toBeInTheDocument()
      
      rerender(<ProgressBar progress={50} color="warning" />)
      progressFill = document.querySelector('.bg-yellow-600')
      expect(progressFill).toBeInTheDocument()
      
      rerender(<ProgressBar progress={50} color="danger" />)
      progressFill = document.querySelector('.bg-red-600')
      expect(progressFill).toBeInTheDocument()
    })

    it('handles different sizes', () => {
      const { rerender } = render(<ProgressBar progress={50} size="sm" />)
      let progressBar = document.querySelector('.h-1')
      expect(progressBar).toBeInTheDocument()
      
      rerender(<ProgressBar progress={50} size="md" />)
      progressBar = document.querySelector('.h-2')
      expect(progressBar).toBeInTheDocument()
      
      rerender(<ProgressBar progress={50} size="lg" />)
      progressBar = document.querySelector('.h-3')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('LoadingState', () => {
    it('renders basic loading state', () => {
      render(<LoadingState stage="Processing" />)
      
      expect(screen.getByText('Processing')).toBeInTheDocument()
    })

    it('shows progress when provided', () => {
      render(<LoadingState stage="Analyzing" progress={65} />)
      
      expect(screen.getByText('Analyzing')).toBeInTheDocument()
      expect(screen.getByText('65%')).toBeInTheDocument()
    })

    it('shows message when provided', () => {
      render(<LoadingState stage="Processing" message="Please wait while we analyze your evidence..." />)
      
      expect(screen.getByText('Please wait while we analyze your evidence...')).toBeInTheDocument()
    })

    it('shows substage when provided', () => {
      render(<LoadingState stage="rule_analysis" substage="Evaluating FRE 901 requirements..." />)
      
      expect(screen.getByText('Evaluating FRE 901 requirements...')).toBeInTheDocument()
    })

    it('shows estimated time when provided', () => {
      render(<LoadingState stage="Processing" estimatedTime="2-3 minutes" />)
      
      expect(screen.getByText('Estimated time: 2-3 minutes')).toBeInTheDocument()
    })

    it('shows step indicators when enabled', () => {
      render(
        <LoadingState 
          stage="Processing" 
          showSteps={true} 
          currentStep={2} 
          totalSteps={4} 
        />
      )
      
      // Should show 4 step indicators
      const stepIndicators = document.querySelectorAll('.w-8.h-8.rounded-full')
      expect(stepIndicators).toHaveLength(4)
    })

    it('displays correct stage icons', () => {
      const { rerender } = render(<LoadingState stage="rule_analysis" />)
      expect(document.querySelector('svg')).toBeInTheDocument()
      
      rerender(<LoadingState stage="authentication" />)
      expect(document.querySelector('svg')).toBeInTheDocument()
      
      rerender(<LoadingState stage="document_analysis" />)
      expect(document.querySelector('svg')).toBeInTheDocument()
      
      rerender(<LoadingState stage="ai_enhancement" />)
      expect(document.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('StatusBadge', () => {
    it('renders success status correctly', () => {
      render(<StatusBadge status="success" text="Compliant" />)
      
      expect(screen.getByText('Compliant')).toBeInTheDocument()
      expect(screen.getByText('Compliant')).toHaveClass('text-green-300')
    })

    it('renders warning status correctly', () => {
      render(<StatusBadge status="warning" text="Review Required" />)
      
      expect(screen.getByText('Review Required')).toBeInTheDocument()
      expect(screen.getByText('Review Required')).toHaveClass('text-yellow-300')
    })

    it('renders error status correctly', () => {
      render(<StatusBadge status="error" text="Non-Compliant" />)
      
      expect(screen.getByText('Non-Compliant')).toBeInTheDocument()
      expect(screen.getByText('Non-Compliant')).toHaveClass('text-red-300')
    })

    it('renders info status correctly', () => {
      render(<StatusBadge status="info" text="Under Review" />)
      
      expect(screen.getByText('Under Review')).toBeInTheDocument()
      expect(screen.getByText('Under Review')).toHaveClass('text-blue-300')
    })

    it('shows icon when enabled', () => {
      render(<StatusBadge status="success" text="Compliant" showIcon={true} />)
      
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('hides icon when disabled', () => {
      render(<StatusBadge status="success" text="Compliant" showIcon={false} />)
      
      expect(document.querySelector('svg')).not.toBeInTheDocument()
    })

    it('handles different sizes', () => {
      const { rerender } = render(<StatusBadge status="success" text="Test" size="sm" />)
      expect(screen.getByText('Test')).toHaveClass('text-xs')
      
      rerender(<StatusBadge status="success" text="Test" size="md" />)
      expect(screen.getByText('Test')).toHaveClass('text-sm')
      
      rerender(<StatusBadge status="success" text="Test" size="lg" />)
      expect(screen.getByText('Test')).toHaveClass('text-base')
    })
  })
})
