//-----------------------------------------------------------------------------
// src/models/active.model.ts
//-----------------------------------------------------------------------------

/**
 * @interface ITList
 */
export interface ITList<T> {
  teams:      T[],
  totalCount: number,
}

///////////////////////////////////////////////////////////////////////////////
// TODO: 06/18/2021
// I want to be able to use this as the base class for all the model
// classes, but I get an error returning the generics from the static
// find() and findById() methods.
///////////////////////////////////////////////////////////////////////////////

/**
 * Base class that defines the methods that every model class needs to
 * implement. If the derived class does not implement the static methods
 * then it will generate an error if the user attempts to call the mehtod.
 */
export default abstract class ActiveModel<T> {

  /**
   * Test function
   */
  static message(): string {
    return `[debug] ActiveModel::message() called`
  }

  /**
   * Static method that must be overwritten by the derived class to look up
   * a single record in the DB for the specified id. It returns the record if
   * it is found, otherwise it returns null.
   * 
   * @method  findById
   * @param   {string} id  - Unique id for the record 
   * @returns {Promise<T>} - Returns the record.
   */
  static findById<T>(id: string): Promise<T> {
    return new Promise( async (resolve, reject) => {
      reject({
        message: `Caller needs to implement the static method findById`
      })
    })
  }

  /**
   * Search for records in the DB. The method returns a list of the records
   * and the total count of all records that match.
   * 
   * @method  find
   * @returns {Promise<ITList<T>}
   */
  static find<T>(): Promise<ITList<T>> {
    return new Promise( async (resolve, reject) => {
      reject({
        message: `Caller needs to implement the static method findById`
      })
    })
  }

  /**
   * Save the record to the DB and return the saved record.
   * 
   * @method  save
   * @param   {T} model
   * @returns {Promise<T>} 
   */
  abstract save(model: T): Promise<T>
}