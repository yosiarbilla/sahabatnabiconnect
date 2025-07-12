import { UsersIcon, HeartIcon } from "lucide-react";

const NoFriendsFound = () => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-6">
        <div className="relative">
          <UsersIcon className="size-20 mx-auto text-base-content/20" />
          <HeartIcon className="size-8 absolute -top-2 -right-2 text-primary animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold mb-3">Belum ada teman</h3>
      <p className="text-lg font-medium text-primary mb-2">
        "Terpisah jarak, tersambung ukhuwah"
      </p>
      <p className="text-base-content/70 max-w-md mx-auto">
        Temukan sahabat nabi dari seluruh dunia dan mulai perjalanan belajar bahasa bersama!
      </p>
      
      <div className="mt-6">
        <div className="btn btn-ghost btn-sm pointer-events-none">
          <span className="loading loading-dots loading-xs"></span>
          Mencari partner bahasa untuk Anda...
        </div>
      </div>
    </div>
  );
};

export default NoFriendsFound;
