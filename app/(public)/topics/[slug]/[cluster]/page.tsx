export default async function ClusterPage({
  params,
}: {
  params: Promise<{ slug: string; cluster: string }>;
}) {
  const { slug, cluster } = await params;

  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        {slug} / {cluster}
      </h1>
      <p className="mt-4 text-muted">Cluster page coming in Phase 7.</p>
    </section>
  );
}