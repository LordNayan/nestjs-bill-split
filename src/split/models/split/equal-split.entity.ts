import { User } from "@split/models/user.entity";
import { Split } from "@split/models/split/split.entity";

export class EqualSplit extends Split {
  constructor(user: User) {
    super(user);
  }
}
