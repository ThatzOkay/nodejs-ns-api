import { LongCategoryName } from "./longCategoryName"
import { Operator } from "./operator"
import { ShortCategoryName } from "./shortCategoryName"
import { TrainCategory } from "./trainCategory"
import { Type } from "./type"

  export type Product = {
    number: string
    categoryCode: TrainCategory
    shortCategoryName: ShortCategoryName
    longCategoryName: LongCategoryName
    operatorName: Operator
    operatorCode: Operator
    type: Type
  }
