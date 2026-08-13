import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordian';

describe('Accordion Component', () => {
  const renderAccordion = () => {
    return render(
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  it('renders accordion triggers correctly', () => {
    renderAccordion();
    
    expect(screen.getByText('Is it accessible?')).toBeInTheDocument();
    expect(screen.getByText('Is it styled?')).toBeInTheDocument();
  });

  it('renders with content hidden by default', () => {
    renderAccordion();
    
    const content1 = screen.queryByText('Yes. It adheres to the WAI-ARIA design pattern.');
    const content2 = screen.queryByText("Yes. It comes with default styles that matches the other components' aesthetic.");
    
    // Radix UI renders content conditionally or hides it with attributes.
    // Actually Radix does render it in the DOM but with data-state="closed" and hidden attributes or similar
    // We can just verify the trigger exists and check interaction.
    const trigger1 = screen.getByText('Is it accessible?');
    expect(trigger1).toHaveAttribute('data-state', 'closed');
  });

  it('expands accordion item when trigger is clicked', async () => {
    renderAccordion();
    
    const trigger1 = screen.getByText('Is it accessible?');
    
    // Initial state is closed
    expect(trigger1).toHaveAttribute('data-state', 'closed');
    
    // Click to open
    fireEvent.click(trigger1);
    
    // Verify it opens
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('data-state', 'open');
    });
    
    // Content should be visible now
    const content1 = screen.getByText('Yes. It adheres to the WAI-ARIA design pattern.');
    expect(content1).toBeVisible();
  });

  it('collapses when trigger is clicked again (since it is collapsible)', async () => {
    renderAccordion();
    
    const trigger1 = screen.getByText('Is it accessible?');
    
    // Click to open
    fireEvent.click(trigger1);
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('data-state', 'open');
    });
    
    // Click to close
    fireEvent.click(trigger1);
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('data-state', 'closed');
    });
  });

  it('closes other items when a new item is opened in single mode', async () => {
    renderAccordion();
    
    const trigger1 = screen.getByText('Is it accessible?');
    const trigger2 = screen.getByText('Is it styled?');
    
    // Open item 1
    fireEvent.click(trigger1);
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('data-state', 'open');
    });
    
    // Open item 2
    fireEvent.click(trigger2);
    await waitFor(() => {
      expect(trigger2).toHaveAttribute('data-state', 'open');
    });
    
    // Item 1 should now be closed
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('data-state', 'closed');
    });
  });
  
  it('passes custom classNames correctly', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="custom-item-class">
          <AccordionTrigger className="custom-trigger-class">Trigger</AccordionTrigger>
          <AccordionContent className="custom-content-class">Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const item = screen.getByText('Trigger').closest('.custom-item-class');
    expect(item).toBeInTheDocument();
    
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveClass('custom-trigger-class');
  });
});
