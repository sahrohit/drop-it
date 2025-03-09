import CreatePostForm from "@/components/forms/create-post-form";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const CreatePostModal = ({ className }: { className?: string }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Credenza open={modalOpen} onOpenChange={(val) => setModalOpen(val)}>
      <CredenzaTrigger asChild>
        <Button className={cn(className)}>Post</Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Add New Post</CredenzaTitle>
          <CredenzaDescription>
            Create a new post by filling out the form below.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <CreatePostForm onSuccess={() => setModalOpen(false)} />
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};
