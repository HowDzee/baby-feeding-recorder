declare module 'sql.js' {
  interface SqlJsDatabase {
    exec(sql: string): { columns: string[]; values: unknown[][] }[]
    run(sql: string, params?: unknown[]): void
    close(): void
  }

  export interface SqlJsStatic {
    Database: {
      new (data?: ArrayLike<number>): SqlJsDatabase
    }
  }

  function initSqlJs(opts?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>
  export default initSqlJs
}
