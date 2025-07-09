type DisputeItem = {
    dispute_id: string;
    create_time: string;
    update_time: string;
    disputed_transactions: any[]; // define better if needed
  };
  
  type Link = {
    href: string;
    rel: string;
    method: string;
  };
  
  type DisputeData = {
    items: DisputeItem[];
    links: Link[];
  };