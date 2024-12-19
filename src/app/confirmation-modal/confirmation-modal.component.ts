import { Component, Output, EventEmitter } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  @Output() confirm = new EventEmitter<boolean>(); // Emit true or false based on user's choice

  constructor(public bsModalRef: BsModalRef) {}

  onConfirm(): void {
    this.confirm.emit(true);
    this.bsModalRef.hide();
  }

  onCancel(): void {
    this.confirm.emit(false);
    this.bsModalRef.hide();
  }
}