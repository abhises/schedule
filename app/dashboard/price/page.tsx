import React from 'react'
import { PricingTable } from '@clerk/nextjs'

const page = () => {
  return (
    <div className='md:p-20 md:mt-10'>
        <span className="text-3xl font-bold block pl-4 mb-10">Pricing Plans</span>

      <PricingTable      />
</div>
  )
}

export default page