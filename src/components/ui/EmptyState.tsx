import { ShoppingCart } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className='flex flex-col items-center justify-center p-10 text-center'>
      <div className='mb-6'>
        <ShoppingCart className='mx-auto text-[128px] text-gray-400' />
      </div>
      <div className='mb-4'>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>The Prescription is empty!</h2>
        <p className='text-gray-600'>Let's start adding your first product. It's quick, easy, and you can always customize it later.</p>
      </div>
    </div>
  );
};

export default EmptyState;