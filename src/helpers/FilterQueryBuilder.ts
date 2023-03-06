import { LogicalFilter } from '../types/Generic';

export class FilterQueryBuilder {
  static RefineFilterParser(filters?: LogicalFilter[]) {
    if (filters?.length > 0) {
      const andQuery = filters?.map((filter: LogicalFilter) => {
        return filter.operator === 'contains' ? { [filter.field]: { [`$regex`]: filter.value, $options: 'i' } } : { [filter.field]: { [`$${filter.operator}`]: filter.value } };
      });

      return { $and: andQuery };
    } else {
      return {};
    }
  }
}
