import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BotMessageMarkdown, PlainUserMessage } from './Chatbot';

describe('chatbot message rendering', () => {
    it('renders assistant Markdown without literal emphasis markers', () => {
        const { container } = render(
            <BotMessageMarkdown text="**Example heading**" />,
        );

        expect(container.querySelector('strong')).toHaveTextContent(
            'Example heading',
        );
        expect(container).not.toHaveTextContent('**');
    });

    it('renders ordered lists and safe external links for assistant messages', () => {
        const { container } = render(
            <BotMessageMarkdown
                text={'1. First item\n2. Second item\n\n[Source](https://example.com)'}
            />,
        );

        expect(container.querySelectorAll('ol > li')).toHaveLength(2);
        expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute(
            'target',
            '_blank',
        );
        expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute(
            'rel',
            'noopener noreferrer',
        );
    });

    it('keeps user message Markdown as plain text', () => {
        const { container } = render(
            <PlainUserMessage text="**untrusted user text**" />,
        );

        expect(container.querySelector('strong')).toBeNull();
        expect(screen.getByText('**untrusted user text**')).toBeInTheDocument();
    });
});
