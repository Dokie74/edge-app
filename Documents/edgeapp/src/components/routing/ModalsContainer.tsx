// src/components/routing/ModalsContainer.tsx - Centralized modal management
import React from 'react';
import { useApp } from '../../contexts';
import { supabase } from '../../services';

// Import modals
import StartReviewCycleModal from '../modals/StartReviewCycleModal';
import CreateReviewCycleModal from '../modals/CreateReviewCycleModal';
import CreateEmployeeModal from '../modals/CreateEmployeeModal';
import EditEmployeeModal from '../modals/EditEmployeeModal';
import GiveKudoModal from '../modals/GiveKudoModal';
import GiveFeedbackModal from '../modals/GiveFeedbackModal';
import UATFeedbackModal from '../modals/UATFeedbackModal';

const ModalsContainer: React.FC = () => {
  const { modal, closeModal } = useApp();

  if (!modal.isOpen) {
    return null;
  }

  // Helper function to handle modal completion
  const handleModalComplete = () => {
    console.log(`✅ ${modal.name} modal completed`);
    if (modal.props?.onComplete) {
      modal.props.onComplete();
    }
    closeModal();
  };

  // Render the appropriate modal based on modal.name
  switch (modal.name) {
    case 'startReviewCycle':
      return (
        <StartReviewCycleModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: handleModalComplete
          }} 
        />
      );

    case 'createReviewCycle':
      return (
        <CreateReviewCycleModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: handleModalComplete
          }} 
        />
      );

    case 'createEmployee':
      return (
        <CreateEmployeeModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: handleModalComplete
          }} 
        />
      );

    case 'editEmployee':
      return (
        <EditEmployeeModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: handleModalComplete
          }} 
        />
      );

    case 'giveKudo':
      return (
        <GiveKudoModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: handleModalComplete
          }} 
        />
      );

    case 'giveFeedback':
      return (
        <GiveFeedbackModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: handleModalComplete
          }} 
        />
      );

    case 'uatFeedback':
      return (
        <UATFeedbackModal 
          closeModal={closeModal}
        />
      );

    default:
      console.warn(`Unknown modal: ${modal.name}`);
      return null;
  }
};

export default ModalsContainer;