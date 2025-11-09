export const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return {
        badge: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow',
        border: 'border-4 border-purple-500 shadow-glow-lg',
        glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
      };
    case 'epic':
      return {
        badge: 'bg-gradient-to-r from-red-600 to-orange-600 text-white',
        border: 'border-4 border-red-500',
        glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]'
      };
    case 'rare':
      return {
        badge: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
        border: 'border-4 border-blue-500',
        glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
      };
    case 'uncommon':
      return {
        badge: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
        border: 'border-4 border-green-500',
        glow: 'hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
      };
    default:
      return {
        badge: 'bg-gray-400 text-white',
        border: 'border-2 border-gray-400',
        glow: ''
      };
  }
};
