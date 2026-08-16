import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Info } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  description: string;
  format?: string;
  rules?: string;
  mandatoryRule?: string;
  example?: string;
  position?: 'top' | 'bottom' | 'right' | 'left';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  description,
  format,
  rules,
  mandatoryRule,
  example,
  position = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(288, window.innerWidth - 24);
    const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 180;

    let place: 'top' | 'bottom' = position === 'bottom' ? 'bottom' : 'top';
    let top = 0;

    if (place === 'top') {
      top = triggerRect.top - tooltipHeight - 8;
      // If it goes off the top edge of the screen, flip to bottom
      if (top < 12) {
        place = 'bottom';
        top = triggerRect.bottom + 8;
      }
    } else {
      top = triggerRect.bottom + 8;
      // If it goes off the bottom edge of the screen, flip to top
      if (top + tooltipHeight > window.innerHeight - 12 && triggerRect.top - tooltipHeight - 8 > 12) {
        top = triggerRect.top - tooltipHeight - 8;
      }
    }

    // Horizontally center relative to trigger button
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    let left = triggerCenterX - tooltipWidth / 2;

    // Clamp left so tooltip stays strictly within viewport (12px margin)
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const tooltipContent = isOpen ? (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${Math.min(288, window.innerWidth - 24)}px`,
        zIndex: 9999,
      }}
      className="p-3 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-2xl border border-slate-700 pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-100"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Header */}
      <div className="flex items-center space-x-1.5 font-bold text-slate-100 pb-1.5 border-b border-slate-700/80 mb-2">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-indigo-200">{title}</span>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-relaxed mb-2 font-normal">
        {description}
      </p>

      {/* Format & Rules details */}
      {(format || mandatoryRule || rules || example) && (
        <div className="space-y-1 text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          {format && (
            <div>
              <span className="text-slate-400 font-semibold">Formato: </span>
              <span className="text-slate-200 font-mono">{format}</span>
            </div>
          )}

          {mandatoryRule && (
            <div>
              <span className="text-slate-400 font-semibold">Obrigatoriedade: </span>
              <span className="text-amber-300">{mandatoryRule}</span>
            </div>
          )}

          {rules && (
            <div>
              <span className="text-slate-400 font-semibold">Regra: </span>
              <span className="text-indigo-300">{rules}</span>
            </div>
          )}

          {example && (
            <div>
              <span className="text-slate-400 font-semibold">Exemplo: </span>
              <span className="text-emerald-400 font-mono">{example}</span>
            </div>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="inline-flex items-center ml-1 align-middle">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-indigo-600 focus:outline-none focus:text-indigo-600 p-0.5 rounded-full hover:bg-indigo-50 transition-colors"
        title={`Ajuda: ${title}`}
        aria-label={`Ajuda sobre ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && createPortal(tooltipContent, document.body)}
    </div>
  );
};

