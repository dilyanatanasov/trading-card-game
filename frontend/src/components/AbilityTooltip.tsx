import { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';

interface AbilityTooltipProps {
  ability: {
    name: string;
    description: string;
    type?: string;
    trigger?: string;
    value?: number;
  };
  children: React.ReactNode;
}

export function AbilityTooltip({ ability, children }: AbilityTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    placement: 'top',
  });

  const hover = useHover(context, { delay: { open: 300, close: 100 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const getTriggerEmoji = (trigger?: string) => {
    switch (trigger) {
      case 'on_play':
        return '🎴';
      case 'on_attack':
        return '⚔️';
      case 'on_destroy':
        return '💀';
      case 'passive':
        return '✨';
      default:
        return '⚡';
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'area_damage':
        return 'from-red-500 to-orange-500';
      case 'direct_damage':
        return 'from-purple-500 to-pink-500';
      case 'lifesteal':
        return 'from-green-500 to-emerald-500';
      case 'resurrect':
        return 'from-yellow-500 to-amber-500';
      case 'shield':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-purple-500 to-indigo-500';
    }
  };

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 max-w-xs"
          >
            <div
              className={`
                bg-gradient-to-br ${getTypeColor(ability.type)}
                rounded-lg shadow-2xl border-2 border-white/30
                backdrop-blur-sm overflow-hidden
                animate-in fade-in-0 zoom-in-95 duration-200
              `}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>

              {/* Content */}
              <div className="relative p-4 space-y-2">
                {/* Ability Name */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    {getTriggerEmoji(ability.trigger)}
                  </span>
                  <h3 className="font-bold text-lg text-white drop-shadow-lg">
                    {ability.name}
                  </h3>
                </div>

                {/* Trigger Type */}
                {ability.trigger && (
                  <div className="flex items-center gap-1 text-xs text-white/90">
                    <span className="px-2 py-0.5 bg-black/30 rounded-full uppercase tracking-wider font-semibold">
                      {ability.trigger.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-white/95 leading-relaxed font-medium">
                  {ability.description}
                </p>

                {/* Value Highlight */}
                {ability.value && (
                  <div className="flex items-center gap-2 text-white pt-2 border-t border-white/20">
                    <span className="text-2xl font-bold">{ability.value}</span>
                    <span className="text-xs uppercase tracking-wide opacity-90">
                      {ability.type?.includes('damage') ? 'Damage' :
                       ability.type?.includes('heal') || ability.type?.includes('lifesteal') ? 'Healing' :
                       'Power'}
                    </span>
                  </div>
                )}

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-tr-full"></div>
              </div>

              {/* Bottom Accent */}
              <div className="h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
