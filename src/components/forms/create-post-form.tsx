"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@/components/ui/label";
import { addPost } from "@/db/mutation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { serverTimestamp } from "firebase/firestore";

const LOCATIONS = ["public", "private"] as const;

const formSchema = z.object({
  content: z.string().nonempty(),
  private: z.enum(LOCATIONS),
});

const CreatePostForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [user] = useAuthState(auth);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const toastId = toast.loading("Getting your geolocation...");

    if (!user?.email) {
      toast.error("You need to be logged in to create a post", { id: toastId });
      return;
    }

    // Getting the geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.promise(
          addPost({
            content: values.content,
            lat: position.coords.latitude,
            long: position.coords.longitude,
            private: "private",
            author: {
              email: user.email ?? undefined,
              displayName: user.displayName ?? undefined,
              photoURL: user.photoURL ?? undefined,
            },
            likes: 0,
            hates: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
          {
            loading: "Creating your post...",
            success: "Post created successfully",
            error: "Failed to create post",
            id: toastId,
          }
        );

        onSuccess?.();
      },
      (err) => {
        toast.error(err.message, { id: toastId });
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="private"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sharing Mode</FormLabel>
              <FormControl>
                <fieldset className="space-y-4">
                  <RadioGroup
                    className="flex flex-wrap gap-2"
                    defaultValue="public"
                    onValueChange={(value) => field.onChange(value)}
                  >
                    {LOCATIONS.map((item) => (
                      <div
                        key={`${item}`}
                        className="border-input has-data-[state=checked]:border-ring relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            id={item}
                            value={item}
                            className="after:absolute after:inset-0"
                          />
                          <Label htmlFor={item}>{item}</Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </fieldset>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default CreatePostForm;
