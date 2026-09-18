import { isGeneratedUsername } from "@/filters/generatedUsernameFilter";

describe("generatedUsernameFilter", () => {
  describe("isGeneratedUsername", () => {
    it("matches generated usernames", () => {
      expect(isGeneratedUsername("PomegranateOk3520")).toBe(true);
      expect(isGeneratedUsername("CapitalFactor382")).toBe(true);
      expect(isGeneratedUsername("BrightLemon42")).toBe(true);
      expect(isGeneratedUsername("Conscious_Age_1077")).toBe(true);
      expect(isGeneratedUsername("Plastic_Ninja_9014")).toBe(true);
      expect(isGeneratedUsername("Happy_Dog_42")).toBe(true);
      expect(isGeneratedUsername("Capital-Factor-382")).toBe(true);
      expect(isGeneratedUsername("Bright-Lemon-42")).toBe(true);
      expect(isGeneratedUsername("Red-Green-Blue-99")).toBe(true);
    });

    it("does not match legitimate usernames", () => {
      expect(isGeneratedUsername("spez")).toBe(false);
      expect(isGeneratedUsername("gallowboob")).toBe(false);
      expect(isGeneratedUsername("Unidan")).toBe(false);
      expect(isGeneratedUsername("PM_ME_YOUR_CATS")).toBe(false);
      expect(isGeneratedUsername("xXDarkLordXx")).toBe(false);
      expect(isGeneratedUsername("throwaway12345")).toBe(false);
      expect(isGeneratedUsername("user_name")).toBe(false);
      expect(isGeneratedUsername("AutoModerator")).toBe(false);
      expect(isGeneratedUsername("RedditCareResources")).toBe(false);
      expect(isGeneratedUsername("test123")).toBe(false);
      expect(isGeneratedUsername("A1b2C3")).toBe(false);
      expect(isGeneratedUsername("IAmABot")).toBe(false);
      expect(isGeneratedUsername("MyNameIs42abc")).toBe(false);
    });

    it("handles edge cases", () => {
      expect(isGeneratedUsername("")).toBe(false);
      expect(isGeneratedUsername("a")).toBe(false);
      expect(isGeneratedUsername("123456")).toBe(false);
      expect(isGeneratedUsername("ExtremelyLongGeneratedLookingNameThatMightBreakThings12345")).toBe(true);
    });
  });
});
