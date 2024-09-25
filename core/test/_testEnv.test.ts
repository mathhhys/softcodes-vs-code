describe("Test environment", () => {
  test("should have SOFTCODES_GLOBAL_DIR env var set to .softcodes-test", () => {
    expect(process.env.SOFTCODES_GLOBAL_DIR).toBeDefined();
    expect(process.env.SOFTCODES_GLOBAL_DIR)?.toMatch(/\.softcodes-test$/);
  });
});
