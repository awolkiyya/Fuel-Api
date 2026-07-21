export class RejectionReasonResource {
    static toResource(reason: any) {
      return {
        id: reason.id,
        code: reason.code,
        label: reason.label,
        priority: reason.priority,
      };
    }
  
    static collection(reasons: any[]) {
      return reasons.map(this.toResource);
    }
  }