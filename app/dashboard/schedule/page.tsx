import React from 'react'
import CustomButton from '@/components/ui/custom-button'
import Link from 'next/link'

const page = () => {
  return (
    <div>
      <div className="flex justify-between h-screen w-screen">
        <div className="m-auto text-center">
        </div>
      </div>
      <div className="absolute top-13 right-4">
        <Link href="/dashboard/schedule/create">
          <CustomButton variant="primary">Create Schedule</CustomButton>
        </Link>
      </div>
    </div>
  )
}

export default page