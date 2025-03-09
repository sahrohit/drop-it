"use client";

import { getPosts } from "@/db/query";
import { useCollection } from "react-firebase-hooks/firestore";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CreatePostModal } from "@/components/partials/post/modal";

const DashboardPage = () => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [value, loading, error] = useCollection(getPosts(latitude, longitude), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        <ResizablePanel defaultSize={20} className="h-screen">
          <div>
            {value?.docs.map((doc) => (
              <div key={doc.id}>{JSON.stringify(doc.data())}, </div>
            ))}
          </div>
          <CreatePostModal />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <Map />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default DashboardPage;
