export enum AdminModal {
  RedactPto = 'RedactPto',
  DeletePto = 'DeletePto',
  DeleteUser = 'DeleteUser',
  RedactUser = 'RedactUser',
  RedactPrompt = 'RedactPrompt',
  DeletePrompt = 'DeletePrompt',
  RedactNeuronNetwork = 'RedactNeuronNetwork',
  DeleteNeuronNetwork = 'DeleteNeuronNetwork',
  EditApplicationPhoto = 'EditApplicationPhoto',
  SelectGalleryPhoto = 'SelectGalleryPhoto',
  AccrualBalance = 'AccrualBalance',
  DeductBalance = 'DeductBalance',
  AddNewNeuronNetwork = 'AddNewNeuronNetwork',
  AddNewPhotoToGallery = 'AddNewPhotoToGallery',
  AddNewPto = 'AddNewPto',
  InviteNewUser = 'InviteNewUser',
  AddNewPrompt = 'AddNewPrompt',
  AddNewPhotoRequirement = 'AddNewPhotoRequirement',
  AddNewDocumentRequirement = 'AddNewDocumentRequirement',
  EditPhotoRequirement = 'EditPhotoRequirement',
  DeletePhotoRequirement = 'DeletePhotoRequirement',
  EditDocumentRequirement = 'EditDocumentRequirement',
  DeleteDocumentRequirement = 'DeleteDocumentRequirement',
  RejectApplication = 'RejectApplication',
  AddNewPtoExpert = 'AddNewPtoExpert'
}

export const ADMIN_MODAL_NAMES = Object.values(AdminModal);
