# Known Issues

This file documents known issues, limitations, and workarounds for the Lulu Tracy Art Portfolio project. Claude should check this before troubleshooting.

## Environment Issues

### Sharp Installation in Restricted Networks
**Issue**: `npm install` fails with sharp error in environments with network restrictions.
```
sharp: Installation error: tunneling socket could not be established, statusCode=403
```
**Impact**: Build and some tests fail.
**Workaround**:
- Use CI/CD for full builds
- TypeScript, lint, and format checks still work
- Hooks skip gracefully when dependencies unavailable

### Node Version Requirements
**Issue**: Gatsby 5.x requires Node 18+.
**Solution**: Ensure `node --version` shows v18.x or higher.

## Build Issues

### Gatsby Cache Corruption
**Symptoms**: Strange build errors, stale content.
**Solution**: Run `make clean && make build`.

### Image Processing Slow
**Cause**: Large source images or many images.
**Solution**:
- Keep source images under 2MB
- Use `GATSBY_CPU_COUNT=4` for parallel processing

## Testing Issues

### gatsby-plugin-image Mock
**Issue**: Tests fail if GatsbyImage not properly mocked.
**Solution**: Mock is in `__mocks__/gatsby-plugin-image.js` - ensure it's loaded.

### matchMedia Not Defined
**Issue**: Tests fail with "matchMedia is not a function".
**Solution**: Mock is in `jest.setup.js` - should auto-load.

---

*Add new issues as they are discovered.*
