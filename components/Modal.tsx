"use client"
import { FormEvent, Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import Image from 'next/image'
import { addUserEmailToProduct } from '@/lib/actions'

interface Props {
  productId: string
}

const Modal = ({ productId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await addUserEmailToProduct(productId, email);
    setIsSubmitting(false);
    setEmail('');
    setIsOpen(false);
  }

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        Track
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog onClose={closeModal} className="fixed inset-0 z-10 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30" onClick={closeModal}></div>
            </TransitionChild>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex justify-between">
                  <div className="p-3 border border-gray-200 rounded-10">
                    <Image
                      src="/assets/icons/logo.svg"
                      alt="logo"
                      width={28}
                      height={28}
                    />
                  </div>

                  <Image
                    src="/assets/icons/x-close.svg"
                    alt="close"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                    onClick={closeModal}
                  />
                </div>

                <DialogTitle as="h4" className="dialog-head_text mt-4">
                  Stay updated with product pricing alerts right in your inbox!
                </DialogTitle>

                <p className="text-sm text-gray-600 mt-2">
                  Never miss a bargain again with our timely alerts!
                </p>

                <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="dialog-input_container flex items-center mt-2">
                    <Image
                      src="/assets/icons/mail.svg"
                      alt='mail'
                      width={18}
                      height={18}
                    />

                    <input
                      required
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className='dialog-input ml-2 p-2 border rounded'
                    />
                  </div>

                  <button type="submit"
                    className="dialog-btn mt-4 p-2 bg-blue-500 text-white rounded"
                  >
                    {isSubmitting ? 'Submitting...' : 'Track'}
                  </button>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Modal
