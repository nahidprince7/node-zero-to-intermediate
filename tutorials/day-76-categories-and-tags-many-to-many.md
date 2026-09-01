# Day 76 — Categories and Tags

> Core lesson: about 75–90 minutes. Add navigable taxonomy without hiding the explicit many-to-many link.

## Learning Objectives

- distinguish a single category from multiple tags;
- create, assign, replace, and remove tag links safely;
- prevent duplicate names and link rows;
- shape nested responses without exposing junction internals.

## 0–20 Minutes — Resource Rules

A post has zero or one category and many tags. Categories organize broad sections; tags are flexible labels. Normalize names at the service boundary, but let unique constraints settle concurrent duplicates.

```ts
export class SetPostTagsDto {
  @IsArray() @ArrayMaxSize(10) @ArrayUnique()
  @IsInt({ each: true }) @IsPositive({ each: true })
  tagIds!: number[];
}
```

Use IDs for assignment. Creating taxonomy and assigning it are different permissions and endpoints.

## 20–45 Minutes — Replace Tags Atomically

Inside one transaction:

1. confirm the post exists;
2. load all requested tags and detect missing IDs;
3. delete links absent from the desired set;
4. insert missing links;
5. return the final controlled shape.

Replacing a set should be idempotent. Repeating the same request must not create duplicates because `PostTag` has composite primary key `(postId, tagId)`.

## 45–65 Minutes — Query Shapes

For API output, flatten link rows:

```ts
const tags = record.tags.map((link) => ({
  id: link.tag.id,
  name: link.tag.name,
}));
```

Keep the junction model visible inside persistence code because it stores `addedAt`; hide it from public JSON unless clients need that metadata. List category posts with a bounded post selection rather than recursively including everything.

## Practice

1. Create category and tag CRUD with unique-name conflicts.
2. Assign three tags, replace them with two, then send the same request again.
3. Reject more than ten tags and any unknown tag ID.
4. Delete one link without deleting either post or tag.
5. Query published posts for one category and one tag.

## Completion Checklist

- [ ] Category and tag rules are distinct.
- [ ] Tag replacement is atomic and idempotent.
- [ ] Duplicate links are impossible.
- [ ] Unknown taxonomy IDs return a clear response.
- [ ] Public JSON hides junction implementation details.

