import { Button } from "components/base/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "components/base/dialog"
import { useAcceptedToS } from "hooks/compliance/useAcceptedToS"
import { ReactElement } from "react"

export function TermsOfServiceDialog(): ReactElement {
  const {
    isTermsOfUseAndPrivacePolicyAccepted:
      isTermsOfServiceAndPrivacePolicyAccepted,
    setIsTermsOfUseAndPrivacyPolicyAccepted:
      setIsTermsOfServiceAndPrivacyPolicyAccepted,
  } = useAcceptedToS()

  return (
    <Dialog modal open={!isTermsOfServiceAndPrivacePolicyAccepted}>
      <DialogContent>
        <div className="flex flex-col gap-5">
          <DialogTitle>Terms of Use and Privacy Policy</DialogTitle>

          <DialogDescription>
            You must accept the{" "}
            <a
              href="https://delv-public.s3.us-east-2.amazonaws.com/delv-terms-of-service.pdf"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Use
            </a>{" "}
            and{" "}
            <a
              href="https://delv-public.s3.us-east-2.amazonaws.com/delv-privacy-policy.pdf"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>{" "}
            to use this app.
          </DialogDescription>

          <DialogFooter>
            <Button
              onClick={() => setIsTermsOfServiceAndPrivacyPolicyAccepted(true)}
            >
              Accept Terms of Use and Privacy Policy
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
